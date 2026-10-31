export interface CatSkin3D {
  id: string;
  name: string;
  flavor: string;
  badge: string;
  color: string;
  glowColor: string;
  roughness: number;
  transmission: number;
  ior: number;
  thickness: number;
  pitch: number;
}

export const CAT_SKINS_3D: CatSkin3D[] = [
  {
    id: 'emerald',
    name: 'Лайм',
    flavor: 'Изумрудное желе (как в видео)',
    badge: '🍏',
    color: '#00ff66',
    glowColor: '#00e676',
    roughness: 0.12,
    transmission: 0.94,
    ior: 1.48,
    thickness: 2.2,
    pitch: 1.0
  },
  {
    id: 'amethyst',
    name: 'Аметист',
    flavor: 'Фиолетовый мармелад (как в видео)',
    badge: '🔮',
    color: '#7b2cbf',
    glowColor: '#9d4edd',
    roughness: 0.14,
    transmission: 0.92,
    ior: 1.46,
    thickness: 2.4,
    pitch: 0.95
  },
  {
    id: 'peach',
    name: 'Персик',
    flavor: 'Клубнично-розовый мусс',
    badge: '🌸',
    color: '#ff4d6d',
    glowColor: '#ff758f',
    roughness: 0.1,
    transmission: 0.95,
    ior: 1.5,
    thickness: 2.0,
    pitch: 1.15
  },
  {
    id: 'citrus',
    name: 'Манго',
    flavor: 'Солнечный цитрус',
    badge: '🥭',
    color: '#ff9e00',
    glowColor: '#ffb703',
    roughness: 0.13,
    transmission: 0.93,
    ior: 1.45,
    thickness: 2.3,
    pitch: 1.05
  },
  {
    id: 'glacier',
    name: 'Айс',
    flavor: 'Кристальный ледник',
    badge: '🧊',
    color: '#00b4d8',
    glowColor: '#90e0ef',
    roughness: 0.06,
    transmission: 0.98,
    ior: 1.54,
    thickness: 1.8,
    pitch: 1.25
  },
  {
    id: 'boba',
    name: 'Карамель',
    flavor: 'Медовый пудинг',
    badge: '🧋',
    color: '#c77dff',
    glowColor: '#e0aaff',
    roughness: 0.16,
    transmission: 0.9,
    ior: 1.44,
    thickness: 2.5,
    pitch: 0.9
  }
];
