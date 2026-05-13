import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Settings, Eye, EyeOff, Minus, Plus, FastForward } from 'lucide-react';

export default function App() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOverlayMode(false);
      }
      if (e.key === ' ' && !showSettings && !isOverlayMode) {
        setIsRunning((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, isOverlayMode]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(inputMinutes * 60 + inputSeconds);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setPreset = (mins: number) => {
    setInputMinutes(mins);
    setInputSeconds(0);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const adjustTime = (delta: number) => {
    setTimeLeft((prev) => Math.max(-3599, prev + delta));
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${isOverlayMode ? 'bg-transparent' : 'bg-neutral-950'}`}>
      
      {/* Overlay Toggle Button (Floating) */}
      {!isOverlayMode && (
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={() => setIsOverlayMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors shadow-xl"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            OBS Overlay Mode
          </button>
        </div>
      )}

      {isOverlayMode && (
        <button
          onClick={() => setIsOverlayMode(false)}
          className="fixed top-0 left-0 w-full h-full cursor-default z-0 opacity-0 bg-transparent"
          title="Click to exit overlay mode"
        />
      )}

      {/* Main Timer Display */}
      <motion.div
        layout
        className="relative z-10 select-none flex flex-col items-center"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-mono font-bold leading-none tabular-nums transition-all duration-300
            ${isOverlayMode ? 'text-[30vw]' : 'text-[20vw]'}
            ${timeLeft < 0 ? 'animate-blink-red' : 'text-neutral-100'}
          `}
        >
          {formatTime(timeLeft)}
        </motion.h1>
        
        {timeLeft < 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 font-sans font-bold uppercase tracking-widest text-lg md:text-3xl"
          >
            Overtime
          </motion.div>
        )}
      </motion.div>

      {/* Controls Container */}
      <AnimatePresence>
        {!isOverlayMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 mt-12 flex flex-col items-center gap-8 w-full max-w-2xl px-6"
          >
            {/* Quick Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 hover:border-neutral-700 transition-all active:scale-95 group"
                title="Reset"
              >
                <RotateCcw className="w-8 h-8 text-neutral-400 group-hover:rotate-[-45deg] transition-transform" />
              </button>

              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`p-6 rounded-3xl transition-all active:scale-95 shadow-2xl flex items-center justify-center
                  ${isRunning ? 'bg-red-500/10 border-2 border-red-500/50 hover:bg-red-500/20' : 'bg-emerald-500 border-none hover:bg-emerald-400'}
                `}
                title={isRunning ? "Pause" : "Start"}
              >
                {isRunning ? (
                  <Pause className="w-10 h-10 text-red-500 fill-red-500" />
                ) : (
                  <Play className="w-10 h-10 text-neutral-950 fill-neutral-950 ml-1" />
                )}
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all active:scale-95
                  ${showSettings ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                `}
                title="Settings"
              >
                <Settings className={`w-8 h-8 ${showSettings ? 'text-emerald-400' : 'text-neutral-400'}`} />
              </button>
            </div>

            {/* Detailed Controls / Settings */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-[32px] shadow-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Time Input */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        Configure Timer
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] text-neutral-600 font-mono">MM</label>
                          <input
                            type="number"
                            value={inputMinutes}
                            onChange={(e) => setInputMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-2xl font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                          />
                        </div>
                        <span className="text-2xl mt-6 text-neutral-700">:</span>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] text-neutral-600 font-mono">SS</label>
                          <input
                            type="number"
                            value={inputSeconds}
                            onChange={(e) => setInputSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-2xl font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <button
                        onClick={resetTimer}
                        className="w-full bg-neutral-100 text-neutral-950 font-bold py-3 rounded-xl hover:bg-white transition-colors"
                      >
                        Apply Time
                      </button>
                    </div>

                    {/* Presets & Adjustments */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <FastForward className="w-3 h-3" />
                        Presets & Adjust
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 5, 10, 15, 30, 60].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => setPreset(mins)}
                            className="py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => adjustTime(-30)}
                          className="flex-1 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Minus className="w-4 h-4" /> 30s
                        </button>
                        <button
                          onClick={() => adjustTime(30)}
                          className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> 30s
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-neutral-600 text-[10px] uppercase tracking-widest text-center max-w-xs leading-relaxed">
              Press <span className="text-neutral-400">Esc</span> or click anywhere to exit overlay mode. <br />
              Add as Browser Source in OBS with 100% width/height.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Exit Hint */}
      {isOverlayMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-neutral-700 uppercase tracking-[0.2em] pointer-events-none opacity-20 hover:opacity-100 transition-opacity"
        >
          Click to exit overlay mode
        </motion.div>
      )}
    </div>
  );
}
