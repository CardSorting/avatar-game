
import { AvatarState, AvatarAction } from '../types';

export const initialState: AvatarState = {
  avatars: [],
  selectedAvatarId: null,
  loadingState: 'idle',
  error: null,
  queue: [],
  batchProgress: null,
};

export function avatarReducer(state: AvatarState, action: AvatarAction): AvatarState {
  switch (action.type) {
    case 'GENERATE_START':
      return { ...state, loadingState: 'generating', error: null };
    
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        loadingState: 'idle',
        avatars: [action.payload, ...state.avatars],
        selectedAvatarId: action.payload.id,
      };

    case 'GENERATE_FAILURE':
      return { ...state, loadingState: 'idle', error: action.payload };

    case 'SELECT_AVATAR':
      return { ...state, selectedAvatarId: action.payload };

    case 'EDIT_START':
      return { ...state, loadingState: 'editing', error: null };

    case 'EDIT_SUCCESS':
      return {
        ...state,
        loadingState: 'idle',
        avatars: [action.payload, ...state.avatars],
        selectedAvatarId: action.payload.id,
      };

    case 'EDIT_FAILURE':
      return { ...state, loadingState: 'idle', error: action.payload };

    case 'DELETE_AVATAR':
      const remainingAvatars = state.avatars.filter(a => a.id !== action.payload);
      return {
        ...state,
        avatars: remainingAvatars,
        // If the selected avatar was deleted, deselect it
        selectedAvatarId: state.selectedAvatarId === action.payload ? null : state.selectedAvatarId
      };

    case 'DELETE_ALL':
      return { ...state, avatars: [], selectedAvatarId: null, queue: [] };

    case 'DISMISS_ERROR':
      return { ...state, error: null };

    case 'LOAD_SUCCESS':
      return { ...state, avatars: action.payload };

    // --- Queue & Batch Logic ---

    case 'ADD_QUEUE_ITEM':
      return { ...state, queue: [...state.queue, action.payload] };

    case 'REMOVE_QUEUE_ITEM':
      return { ...state, queue: state.queue.filter(item => item.id !== action.payload) };

    case 'SET_QUEUE':
      return { ...state, queue: action.payload };

    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };

    case 'BATCH_START':
      return { 
        ...state, 
        loadingState: 'batching', 
        error: null,
        batchProgress: { current: 0, total: action.payload }
      };

    case 'BATCH_PROGRESS':
      return {
        ...state,
        batchProgress: state.batchProgress 
          ? { ...state.batchProgress, current: action.payload }
          : null
      };

    case 'BATCH_ITEM_SUCCESS':
      return {
        ...state,
        avatars: [action.payload, ...state.avatars],
        selectedAvatarId: action.payload.id
      };

    case 'BATCH_COMPLETE':
      return {
        ...state,
        loadingState: 'idle',
        batchProgress: null,
        queue: []
      };

    default:
      return state;
  }
}
