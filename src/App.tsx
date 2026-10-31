import { useState } from 'react';
import { CAT_SKINS, type CatSkin } from './skins';
import { JellyCanvas } from './JellyCanvas';
import { sound } from './audio';
import { Volume2, VolumeX, Sparkles, Smile, Moon, Zap, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [selectedSkin, setSelectedSkin] = useState<CatSkin>(CAT_SKINS[0]);
  const [expression, setExpression] = useState<'happy' | 'sleepy' | 'surprised' | 'playful'>('happy');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [petCount, setPetCount] = useState<number>(0);
  const [, setFeedCount] = useState<number>(0);
  const [squishCount, setSquishCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleMeow = () => {
    sound.playMeow(selectedSkin.pitchMultiplier);
    setExpression('playful');
    setTimeout(() => setExpression('happy'), 1600);
  };

  const handlePet = () => {
    setPetCount(prev => prev + 1);
    if ((petCount + 1) % 15 === 0) {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 }
      });
      showToast('Котик мурлычет от счастья! ✨');
    }
  };

  const handleFed = () => {
    setFeedCount(prev => prev + 1);
    showToast('Ням! Спасибо за угощение! 🐾');
  };

  const handleSquish = () => {
    setSquishCount(prev => prev + 1);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Jelly Cat — Интерактивная желейная кошка',
      text: 'Потискай эту желейную кошку! Она пружинит, мурлычет и кушает рыбку 🐾',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Ссылка скопирована в буфер обмена!');
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#fafaf9] dark:bg-[#0c0d12] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      <div
        className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-20 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${selectedSkin.innerEarColor} 0%, transparent 60%)`
        }}
      />

      <header className="relative z-10 w-full px-5 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-white/70 dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/10">
            {selectedSkin.badge}
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-none text-slate-900 dark:text-white">
              Jelly Cat
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase mt-0.5">
              Интерактивный пудинг
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            onClick={handleMeow}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95"
          >
            <span>Мяу!</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
            title="Поделиться"
          >
            <Share2 size={17} />
          </button>
        </div>
      </header>

      <main className="relative flex-1 w-full h-full overflow-hidden">
        <JellyCanvas
          skin={selectedSkin}
          expression={expression}
          onPet={handlePet}
          onFed={handleFed}
          squishCount={squishCount}
          onSquish={handleSquish}
        />

        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-medium shadow-xl backdrop-blur-md transition-all animate-bounce">
            {toastMessage}
          </div>
        )}

        <div className="pointer-events-none absolute top-4 left-6 hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-normal">
          <span>👆</span>
          <span>Тяни за щёчки, гладь или нажимай</span>
        </div>
      </main>

      <footer className="relative z-10 w-full px-4 py-3.5 border-t border-black/5 dark:border-white/5 backdrop-blur-lg bg-white/40 dark:bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Вкус:
          </span>
          {CAT_SKINS.map((s) => {
            const isSelected = s.id === selectedSkin.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSkin(s);
                  sound.playBoing();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm scale-105'
                    : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/5'
                }`}
              >
                <span>{s.badge}</span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full shrink-0">
          <button
            onClick={() => setExpression('happy')}
            className={`p-1.5 px-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              expression === 'happy'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
            title="Счастливый"
          >
            <Smile size={14} />
            <span className="hidden md:inline">Радость</span>
          </button>

          <button
            onClick={() => setExpression('playful')}
            className={`p-1.5 px-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              expression === 'playful'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
            title="Игривый"
          >
            <Zap size={14} />
            <span className="hidden md:inline">Играть</span>
          </button>

          <button
            onClick={() => setExpression('surprised')}
            className={`p-1.5 px-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              expression === 'surprised'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
            title="Удивлённый"
          >
            <Sparkles size={14} />
            <span className="hidden md:inline">Ого!</span>
          </button>

          <button
            onClick={() => setExpression('sleepy')}
            className={`p-1.5 px-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              expression === 'sleepy'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
            title="Сонный"
          >
            <Moon size={14} />
            <span className="hidden md:inline">Дремота</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
