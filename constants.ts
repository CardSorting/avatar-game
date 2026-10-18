
import { Trait } from './types';
import { TraitManager } from './services/TraitFactories';

export const GEMINI_MODEL = 'gemini-2.5-flash-image';

export const DEFAULT_AVATAR_PROMPT = "A close-up portrait of a futuristic cyberpunk character, neon lighting, detailed digital art style";

// Initialize the Trait Manager and generate the master list
const manager = new TraitManager();

export const TRAITS: Trait[] = manager.getAllTraits();
