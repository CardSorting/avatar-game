
import { useReducer, useCallback, useEffect } from 'react';
import { avatarReducer, initialState } from '../store/avatarReducer';
import { generateAvatarImage, editAvatarImage } from '../services/geminiService';
import { avatarStorage } from '../services/storageService';
import { Avatar, Trait, QueueItem } from '../types';

export const useAvatarStudio = () => {
  const [state, dispatch] = useReducer(avatarReducer, initialState);

  // Initial Load from IndexedDB
  useEffect(() => {
    const hydrateState = async () => {
      const savedAvatars = await avatarStorage.getAllAvatars();
      if (savedAvatars && savedAvatars.length > 0) {
        dispatch({ type: 'LOAD_SUCCESS', payload: savedAvatars });
      }
    };
    hydrateState();
  }, []);

  // Selector for currently active avatar
  const selectedAvatar = state.avatars.find(a => a.id === state.selectedAvatarId);

  // --- Actions ---

  const generate = useCallback(async (prompt: string, referenceImage?: string) => {
    if (!prompt.trim()) return;
    dispatch({ type: 'GENERATE_START' });
    try {
      const imageData = await generateAvatarImage(prompt, referenceImage);
      const newAvatar: Avatar = {
        id: crypto.randomUUID(),
        imageData,
        prompt,
        createdAt: Date.now(),
      };
      
      await avatarStorage.saveAvatar(newAvatar);
      dispatch({ type: 'GENERATE_SUCCESS', payload: newAvatar });
      
    } catch (error: any) {
      console.error("Generation workflow failed:", error);
      dispatch({ type: 'GENERATE_FAILURE', payload: error.message || 'Generation failed' });
    }
  }, []);

  const generateBatch = useCallback(async (items: { prompt: string; referenceImage?: string }[]) => {
    if (!items || items.length === 0) return;
    dispatch({ type: 'BATCH_START', payload: items.length });

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.prompt) continue;
        
        dispatch({ type: 'BATCH_PROGRESS', payload: i + 1 });
        
        // RATE LIMIT BUFFER: Increased delay to 6s (10 RPM limit safety) to prevent 429s on larger sets
        if (i > 0) await new Promise(r => setTimeout(r, 6000));

        const imageData = await generateAvatarImage(item.prompt, item.referenceImage);
        const newAvatar: Avatar = {
          id: crypto.randomUUID(),
          imageData,
          prompt: item.prompt,
          createdAt: Date.now(),
        };
        
        await avatarStorage.saveAvatar(newAvatar);
        dispatch({ type: 'BATCH_ITEM_SUCCESS', payload: newAvatar });
      }
      dispatch({ type: 'BATCH_COMPLETE' });
    } catch (error: any) {
      console.error("Batch generation failed:", error);
      dispatch({ type: 'GENERATE_FAILURE', payload: error.message || 'Batch generation failed' });
    }
  }, []);

  const edit = useCallback(async (instruction: string) => {
    if (!selectedAvatar || !instruction.trim()) return;
    dispatch({ type: 'EDIT_START' });
    try {
      const imageData = await editAvatarImage(selectedAvatar.imageData, instruction);
      const newAvatar: Avatar = {
        id: crypto.randomUUID(),
        imageData,
        prompt: instruction,
        createdAt: Date.now(),
        parentId: selectedAvatar.id
      };
      
      await avatarStorage.saveAvatar(newAvatar);
      dispatch({ type: 'EDIT_SUCCESS', payload: newAvatar });

    } catch (error: any) {
      console.error("Edit workflow failed:", error);
      dispatch({ type: 'EDIT_FAILURE', payload: error.message || 'Edit failed' });
    }
  }, [selectedAvatar]);

  const selectAvatar = useCallback((id: string) => dispatch({ type: 'SELECT_AVATAR', payload: id }), []);

  const deleteAvatar = useCallback(async (id: string) => {
    try {
      await avatarStorage.deleteAvatar(id);
      dispatch({ type: 'DELETE_AVATAR', payload: id });
    } catch (error) {
       console.error("Failed to delete avatar:", error);
       dispatch({ type: 'DELETE_AVATAR', payload: id });
    }
  }, []);

  const deleteAll = useCallback(async () => {
    try {
      await avatarStorage.clearStore();
      dispatch({ type: 'DELETE_ALL' });
    } catch (error) {
      console.error("Failed to clear library:", error);
      dispatch({ type: 'DELETE_ALL' }); 
    }
  }, []);

  const dismissError = useCallback(() => dispatch({ type: 'DISMISS_ERROR' }), []);

  // --- Batch / Queue Actions ---

  const addTraitToQueue = useCallback((trait: Trait) => {
    const item: QueueItem = {
        id: crypto.randomUUID(),
        type: 'trait',
        label: trait.name,
        prompt: trait.promptSuffix,
        icon: trait.icon,
        traitId: trait.id
    };
    dispatch({ type: 'ADD_QUEUE_ITEM', payload: item });
  }, []);

  const addTextToQueue = useCallback((text: string) => {
    const item: QueueItem = {
        id: crypto.randomUUID(),
        type: 'text',
        label: text,
        prompt: text,
        icon: '✏️'
    };
    dispatch({ type: 'ADD_QUEUE_ITEM', payload: item });
  }, []);

  const removeQueueItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_QUEUE_ITEM', payload: id });
  }, []);

  const setQueue = useCallback((items: QueueItem[]) => {
    dispatch({ type: 'SET_QUEUE', payload: items });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  const runBatch = useCallback(async () => {
    if (state.queue.length === 0 || !selectedAvatar) return;
    
    dispatch({ type: 'BATCH_START', payload: state.queue.length });
    
    // We start from the current avatar, and create variations (not chained)
    // The source image is ALWAYS the currently selected avatar for all items in queue
    const sourceImageData = selectedAvatar.imageData;
    const parentId = selectedAvatar.id;

    try {
        for (let i = 0; i < state.queue.length; i++) {
            const item = state.queue[i];
            
            // Update progress: "Processing item i+1"
            dispatch({ type: 'BATCH_PROGRESS', payload: i + 1 });
            
            // RATE LIMIT BUFFER: Increased delay to 6s (10 RPM limit safety) to prevent 429s on larger sets
            if (i > 0) await new Promise(r => setTimeout(r, 6000));
            
            // API Call - Always use sourceImageData
            const newImageData = await editAvatarImage(sourceImageData, item.prompt);
            
            // Create Avatar Object
            const newAvatar: Avatar = {
                id: crypto.randomUUID(),
                imageData: newImageData,
                prompt: item.prompt,
                createdAt: Date.now(),
                parentId: parentId
            };
            
            // Persist
            await avatarStorage.saveAvatar(newAvatar);
            
            // Update UI (adds to list, sets as selected)
            dispatch({ type: 'BATCH_ITEM_SUCCESS', payload: newAvatar });
        }
        dispatch({ type: 'BATCH_COMPLETE' });

    } catch (error: any) {
        console.error("Batch workflow failed:", error);
        // Note: We might want to clear loading state or handle partial success differently
        dispatch({ type: 'EDIT_FAILURE', payload: error.message || 'Batch sequence failed' });
    }
  }, [state.queue, selectedAvatar]);

  return {
    state,
    selectedAvatar,
    actions: {
      generate,
      generateBatch,
      edit,
      selectAvatar,
      deleteAvatar,
      deleteAll,
      dismissError,
      addTraitToQueue,
      addTextToQueue,
      removeQueueItem,
      setQueue,
      clearQueue,
      runBatch
    }
  };
};
