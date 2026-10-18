
export interface Avatar {
  id: string;
  imageData: string;
  prompt: string;
  createdAt: number;
  parentId?: string; // For tracking lineage
}

export interface Trait {
  id: string;
  name: string;
  category: TraitCategory;
  promptSuffix: string;
  icon: string;
}

export type QueueItemType = 'trait' | 'text';

export interface QueueItem {
  id: string; // Unique instance ID in the queue
  type: QueueItemType;
  label: string; // Display name
  prompt: string; // The instruction to send to API
  icon?: string;
  traitId?: string; // Reference to original trait ID if applicable
}

export enum TraitCategory {
  BACKGROUND = 'Background',
  EYES = 'Eyes & Face',
  ACCESSORIES = 'Accessories',
  EFFECTS = 'SFX/VFX',
  STYLE = 'Art Style',
  // New Immersive Categories
  LIGHTING = 'Cinematic Lighting',
  CAMERA = 'Camera & Lens',
  TEXTURE = 'Skin & Texture',
  ATMOSPHERE = 'Atmosphere'
}

export type LoadingState = 'idle' | 'generating' | 'editing' | 'batching' | 'error';

export interface BatchProgress {
  current: number;
  total: number;
}

// Centralized State Shape
export interface AvatarState {
  avatars: Avatar[];
  selectedAvatarId: string | null;
  loadingState: LoadingState;
  error: string | null;
  queue: QueueItem[];
  batchProgress: BatchProgress | null;
}

// Action Types for Reducer
export type AvatarAction =
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: Avatar }
  | { type: 'GENERATE_FAILURE'; payload: string }
  | { type: 'SELECT_AVATAR'; payload: string }
  | { type: 'EDIT_START' }
  | { type: 'EDIT_SUCCESS'; payload: Avatar }
  | { type: 'EDIT_FAILURE'; payload: string }
  | { type: 'DELETE_AVATAR'; payload: string }
  | { type: 'DELETE_ALL' }
  | { type: 'DISMISS_ERROR' }
  | { type: 'LOAD_SUCCESS'; payload: Avatar[] }
  // Queue & Batch Actions
  | { type: 'ADD_QUEUE_ITEM'; payload: QueueItem }
  | { type: 'REMOVE_QUEUE_ITEM'; payload: string } // payload is queue item id
  | { type: 'SET_QUEUE'; payload: QueueItem[] }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'BATCH_START'; payload: number } // payload = total items
  | { type: 'BATCH_PROGRESS'; payload: number } // payload = current index
  | { type: 'BATCH_ITEM_SUCCESS'; payload: Avatar }
  | { type: 'BATCH_COMPLETE' };
