
import { Trait, TraitCategory } from '../types';

// Abstract Factory
abstract class TraitFactory {
  abstract category: TraitCategory;
  abstract createTraits(): Trait[];

  protected createTrait(id: string, name: string, promptSuffix: string, icon: string): Trait {
    return {
      id,
      name,
      category: this.category,
      promptSuffix,
      icon
    };
  }
}

// Concrete Factory: Backgrounds
export class BackgroundFactory extends TraitFactory {
  category = TraitCategory.BACKGROUND;

  createTraits(): Trait[] {
    return [
      this.createTrait('bg-city', 'Cyber City', 'Change the background to a rainy neon cyberpunk city with towering skyscrapers', '🏙️'),
      this.createTrait('bg-space', 'Deep Space', 'Change the background to a deep space nebula with swirling stardust and distant planets', '🌌'),
      this.createTrait('bg-studio', 'Studio', 'Change the background to a clean, minimal high-end photography studio backdrop', '🌫️'),
      this.createTrait('bg-lab', 'Bio-Lab', 'Change the background to a futuristic biological research laboratory with containment tanks', '🧪'),
    ];
  }
}

// Concrete Factory: Biotech & Eyes
export class BiotechFactory extends TraitFactory {
  category = TraitCategory.EYES;

  createTraits(): Trait[] {
    return [
      this.createTrait('eyes-glow', 'Optical Overload', 'Make the eyes glow with intense, blinding white light leaking energy', '👀'),
      this.createTrait('face-robot', 'Cyborg Plating', 'Turn half of the face into exposed brushed titanium robotic plating with warning decals', '🤖'),
      this.createTrait('face-happy', 'Warm Smile', 'Make the character smile warmly and genuinely', '😊'),
      this.createTrait('face-scanner', 'Targeting Reticle', 'Add a holographic targeting reticle monocle over one eye', '🎯'),
    ];
  }
}

// Concrete Factory: Immersive Lighting (Updated)
export class LightingFactory extends TraitFactory {
  category = TraitCategory.LIGHTING;

  createTraits(): Trait[] {
    return [
      this.createTrait('light-neon', 'Dual Neon', 'Apply cinematic dual-tone lighting with hot pink on the left and cyan on the right', '🟣'),
      this.createTrait('light-noir', 'Cyber Noir', 'Apply high-contrast noir lighting with deep shadows and harsh Venetian blind slat shadows', '🌑'),
      this.createTrait('light-volumetric', 'God Rays', 'Add volumetric god rays shining from behind the character creating a silhouette effect', '☀️'),
      this.createTrait('light-bio', 'Bioluminescence', 'Illuminate the scene solely with the soft blue glow of the character\'s own bioluminescent markings', '🔦'),
      this.createTrait('light-prism', 'Prism Refraction', 'Overlay soft rainbow light leaks and prismatic glass distortions', '🌈'),
      this.createTrait('light-golden', 'Golden Hour', 'Apply warm, golden hour sunlight hitting the face from the side', '🌅'),
    ];
  }
}

// Concrete Factory: Camera & Lens (New)
export class CameraFactory extends TraitFactory {
  category = TraitCategory.CAMERA;

  createTraits(): Trait[] {
    return [
      this.createTrait('cam-low', 'Hero Angle', 'Change the camera angle to a low angle looking up at the character to make them look dominant', '📐'),
      this.createTrait('cam-fish', 'Fisheye Lens', 'Apply a distorted 180-degree fisheye lens effect for an edgy look', '🐟'),
      this.createTrait('cam-bokeh', 'Macro Bokeh', 'Apply an extremely shallow depth of field, blurring everything except the eyes', '📷'),
      this.createTrait('cam-drone', 'High Angle', 'Change the camera angle to a high-down angle looking slightly down at the character', '🚁'),
    ];
  }
}

// Concrete Factory: Textures & Materials
export class TextureFactory extends TraitFactory {
  category = TraitCategory.TEXTURE;

  createTraits(): Trait[] {
    return [
      this.createTrait('tex-carbon', 'Carbon Fiber', 'Change the skin texture to a matte black woven carbon fiber material', '🏁'),
      this.createTrait('tex-chrome', 'Liquid Chrome', 'Turn the skin into highly reflective, mirror-finish liquid chrome', '💿'),
      this.createTrait('tex-glitch', 'Hologram Mesh', 'Turn the character into a semi-translucent wireframe holographic projection', '🌐'),
      this.createTrait('tex-gold', 'Kintsugi', 'Add gold leaf cracks repairing the skin in the style of Kintsugi pottery', '🏺'),
    ];
  }
}

// Concrete Factory: Atmosphere
export class AtmosphereFactory extends TraitFactory {
  category = TraitCategory.ATMOSPHERE;

  createTraits(): Trait[] {
    return [
      this.createTrait('atmo-rain', 'Acid Rain', 'Add heavy, cinematic rain droplets running down the "camera" lens and the character', '🌧️'),
      this.createTrait('atmo-fog', 'Toxic Haze', 'Engulf the lower frame in a thick, mysterious green ground fog', '🌫️'),
      this.createTrait('atmo-sparks', 'Welding Sparks', 'Fill the air with flying hot orange welding sparks and embers', '💥'),
    ];
  }
}

// Concrete Factory: Accessories
export class AccessoriesFactory extends TraitFactory {
  category = TraitCategory.ACCESSORIES;

  createTraits(): Trait[] {
    return [
      this.createTrait('acc-visor', 'Tech Visor', 'Add a sleek, glowing OLED strip visor covering the eyes', '🕶️'),
      this.createTrait('acc-mask', 'Respirator', 'Add a heavy industrial cyberpunk respirator mask covering the mouth', '😷'),
      this.createTrait('acc-halo', 'Data Halo', 'Add a floating holographic halo of data ring circling the head', '😇'),
    ];
  }
}

// Concrete Factory: Effects & Style
export class FXFactory extends TraitFactory {
  category = TraitCategory.EFFECTS;

  createTraits(): Trait[] {
    return [
      this.createTrait('vfx-glitch', 'Data Mosh', 'Apply a heavy digital datamosh glitch effect, fragmenting the image', '👾'),
      this.createTrait('vfx-retro', 'VHS Tape', 'Apply a vintage 1980s VHS filter aesthetic with tracking lines and noise', '📼'),
      this.createTrait('style-synth', 'Synthwave', 'Change the art style to an 80s airbrushed synthwave aesthetic', '🌴'),
      this.createTrait('style-ink', 'Ink & Wash', 'Change the art style to traditional Japanese Sumi-e ink wash painting', '🖌️'),
    ];
  }
}

// Orchestrator
export class TraitManager {
  private factories: TraitFactory[] = [];

  constructor() {
    this.factories = [
      new BackgroundFactory(),
      new LightingFactory(),
      new CameraFactory(), // Added Camera Factory
      new TextureFactory(),
      new BiotechFactory(),
      new AtmosphereFactory(),
      new AccessoriesFactory(),
      new FXFactory(),
    ];
  }

  getAllTraits(): Trait[] {
    return this.factories.flatMap(factory => factory.createTraits());
  }
}
