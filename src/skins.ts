export interface CatSkin {
  id: string;
  name: string;
  colorName: string;
  badge: string;
  bodyColor: string;
  highlightColor: string;
  innerEarColor: string;
  cheekColor: string;
  eyeColor: string;
  pupilColor: string;
  outlineColor: string;
  shadowColor: string;
  springStiffness: number; // jelly bounciness
  damping: number;
  pitchMultiplier: number;
}

export const CAT_SKINS: CatSkin[] = [
  {
    id: 'peach',
    name: 'Персик',
    colorName: 'Розовое желе',
    badge: '🌸',
    bodyColor: 'rgba(255, 154, 182, 0.88)',
    highlightColor: 'rgba(255, 235, 242, 0.9)',
    innerEarColor: '#ff7096',
    cheekColor: '#ff5c8a',
    eyeColor: '#2b2d42',
    pupilColor: '#ffffff',
    outlineColor: 'rgba(235, 110, 145, 0.6)',
    shadowColor: 'rgba(217, 75, 115, 0.22)',
    springStiffness: 0.12,
    damping: 0.86,
    pitchMultiplier: 1.15
  },
  {
    id: 'matcha',
    name: 'Матча',
    colorName: 'Фисташковый пудинг',
    badge: '🍵',
    bodyColor: 'rgba(163, 217, 165, 0.88)',
    highlightColor: 'rgba(238, 252, 238, 0.9)',
    innerEarColor: '#8ec592',
    cheekColor: '#72b677',
    eyeColor: '#1b3b22',
    pupilColor: '#ffffff',
    outlineColor: 'rgba(100, 170, 105, 0.6)',
    shadowColor: 'rgba(60, 130, 70, 0.2)',
    springStiffness: 0.1,
    damping: 0.88,
    pitchMultiplier: 0.95
  },
  {
    id: 'mango',
    name: 'Манго',
    colorName: 'Тропический мармелад',
    badge: '🥭',
    bodyColor: 'rgba(255, 194, 92, 0.9)',
    highlightColor: 'rgba(255, 245, 215, 0.92)',
    innerEarColor: '#ff9f1c',
    cheekColor: '#f77f00',
    eyeColor: '#3a2002',
    pupilColor: '#ffffff',
    outlineColor: 'rgba(230, 145, 30, 0.65)',
    shadowColor: 'rgba(200, 110, 15, 0.25)',
    springStiffness: 0.14,
    damping: 0.84,
    pitchMultiplier: 1.05
  },
  {
    id: 'lavender',
    name: 'Лаванда',
    colorName: 'Черничный йогурт',
    badge: '🫐',
    bodyColor: 'rgba(189, 165, 245, 0.88)',
    highlightColor: 'rgba(245, 238, 255, 0.9)',
    innerEarColor: '#a78bfa',
    cheekColor: '#9067ea',
    eyeColor: '#241b44',
    pupilColor: '#ffffff',
    outlineColor: 'rgba(145, 115, 225, 0.6)',
    shadowColor: 'rgba(110, 80, 190, 0.22)',
    springStiffness: 0.11,
    damping: 0.87,
    pitchMultiplier: 1.1
  },
  {
    id: 'boba',
    name: 'Боба',
    colorName: 'Карамельный пудинг',
    badge: '🧋',
    bodyColor: 'rgba(204, 160, 122, 0.88)',
    highlightColor: 'rgba(250, 238, 225, 0.9)',
    innerEarColor: '#b08968',
    cheekColor: '#9c6644',
    eyeColor: '#2b1b17',
    pupilColor: '#ffffff',
    outlineColor: 'rgba(150, 100, 65, 0.6)',
    shadowColor: 'rgba(100, 65, 40, 0.25)',
    springStiffness: 0.13,
    damping: 0.85,
    pitchMultiplier: 0.9
  },
  {
    id: 'glacier',
    name: 'Айс',
    colorName: 'Ледяной кристалл',
    badge: '🧊',
    bodyColor: 'rgba(135, 220, 245, 0.85)',
    highlightColor: 'rgba(240, 253, 255, 0.95)',
    innerEarColor: '#56cfe1',
    cheekColor: '#48cae4',
    eyeColor: '#03045e',
    pupilColor: '#ffffff',
    outlineColor: 'rgba(70, 180, 220, 0.6)',
    shadowColor: 'rgba(30, 130, 175, 0.2)',
    springStiffness: 0.15,
    damping: 0.83,
    pitchMultiplier: 1.25
  }
];