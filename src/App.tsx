import { useState } from 'react';
import { CAT_SKINS_3D, type CatSkin3D } from './skins3d';
import { JellyView3D } from './components/JellyView3D';
import { sound } from './audio';
import { Volume2, VolumeX, Sparkles, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [selectedSkin, setSelectedSkin] = useState<CatSkin3D>(CAT_SKINS_3D[0]);
  const [customColor, setCustomColor] = useState<string>(CAT_SKINS_3D[0].color);
  const [lightDir, setLightDir] = useState<number>(0.65);
  const [quality, setQuality] = useState<'Low' | 'Medium' | 'Ultra'>('Ultra');
  const [enableBlur, setEnableBlur] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [petCount, setPetCount] = useState<number>(0);
  const [squishProgress, setSquishProgress] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // When custom color is picked
  const handleColorChange = (hex: string) => {
    setCustomColor(hex);
    setSelectedSkin(prev => ({
      ...prev,
      color: hex,
      glowColor: hex,
    }));
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handlePet = () => {
    setPetCount(prev => prev + 1);
    if ((petCount + 1) % 15 === 0) {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
      showToast('Котик довольно мурлычет! ✨');
    }
  };

  const handleSquish = () => {
    setSquishProgress(Math.floor(20 + Math.random() * 80));
    setTimeout(() => setSquishProgress(100), 1200);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleShare = async () => {
    const shareData = {
      title: '3D Jelly Cat — Настоящая желейная кошка',
      text: 'Потрогай 3D желейную кошку с физическим стеклянным шейдером и мурлыканьем! 🐾',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Ссылка скопирована!');
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#f0f2f6] text-slate-800 overflow-hidden font-sans select-none">
      {/* Top Controls Overlay - Exact design from the video */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-3 bg-white/75 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-xl w-64 text-sm font-medium">
        {/* Quality select */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Quality</span>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as 'Low' | 'Medium' | 'Ultra')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="Ultra">Ultra</option>
          </select>
        </div>

        {/* Light dir slider */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Light dir</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={lightDir}
            onChange={(e) => setLightDir(parseFloat(e.target.value))}
            className="w-28 accent-slate-800 cursor-pointer"
          />
        </div>

        {/* Jelly Color picker */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Jelly Color</span>
          <div className="relative flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-14 h-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden shadow-inner"
            />
          </div>
        </div>

        {/* Blur toggle */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Blur</span>
          <input
            type="checkbox"
            checked={enableBlur}
            onChange={(e) => setEnableBlur(e.target.checked)}
            className="w-4 h-4 accent-slate-800 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Top Right Header Buttons */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={handleToggleMute}
          className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-black/5 shadow-md text-slate-700 transition-all active:scale-95"
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        <button
          onClick={handleShare}
          className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-black/5 shadow-md text-slate-700 transition-all active:scale-95"
          title="Поделиться"
        >
          <Share2 size={17} />
        </button>
      </div>

      {/* 3D WebGL Canvas Area */}
      <main className="relative flex-1 w-full h-full">
        <JellyView3D
          skin={selectedSkin}
          lightDirection={lightDir}
          quality={quality}
          enableBlur={enableBlur}
          onPet={handlePet}
          onSquish={handleSquish}
        />

        {/* Realistic Jelly Elasticity Gauge (matching the video's 100% / % display) */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <div className="px-5 py-1.5 rounded-full bg-black/5 backdrop-blur-sm border border-black/5 text-slate-500 text-xs font-mono font-medium">
            Elasticity: <span className="font-bold text-slate-800">{squishProgress}%</span>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium shadow-xl backdrop-blur-md animate-bounce">
            {toastMessage}
          </div>
        )}
      </main>

      {/* Bottom Bar: 3D Preset Flavors */}
      <footer className="relative z-30 w-full px-5 py-3.5 bg-white/70 backdrop-blur-md border-t border-black/5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            3D Вкусы:
          </span>
          <div className="flex items-center gap-2">
            {CAT_SKINS_3D.map((s) => {
              const isSelected = s.id === selectedSkin.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSkin(s);
                    setCustomColor(s.color);
                    sound.playBoing();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md scale-105'
                      : 'bg-white/60 hover:bg-white border border-black/5 text-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0">
          <Sparkles size={14} />
          <span>Кликай и тяни в 3D для деформации желе</span>
        </div>
      </footer>
    </div>
  );
}
