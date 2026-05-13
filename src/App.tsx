import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Settings, Eye, EyeOff, Minus, Plus, FastForward, List, ChevronRight, ChevronLeft, Trash2, StickyNote, Layout } from 'lucide-react';

interface Event {
  id: string;
  label: string;
  durationInSeconds: number;
  time?: string;
  pic?: string;
}

export default function App() {
  const [timeLeft, setTimeLeft] = useState(600); // Default to first event duration
  const [isRunning, setIsRunning] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(10);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true); // Default to showing schedule
  const [countdownMode, setCountdownMode] = useState<'duration' | 'targetTime'>('duration');
  
  // Updated Default States with provided schedule
  const [events, setEvents] = useState<Event[]>([
    { id: '1', label: 'Sambutan Ketua acara dan Doa Pembuka', durationInSeconds: 600, time: '16.00 - 16.10', pic: 'Bpk. Irwan' },
    { id: '2', label: 'Praise and Worship', durationInSeconds: 1800, time: '16.10 - 16.40', pic: 'Ibu Ester' },
    { id: '3', label: 'Firman Tuhan', durationInSeconds: 2400, time: '16.40 - 17.20', pic: 'Pdt. Andre Niko' },
    { id: '4', label: 'Faith Harmony', durationInSeconds: 300, time: '17.20 - 17.25', pic: 'Ibu Ester' },
    { id: '5', label: 'Kata Sambutan Gembala Sidang', durationInSeconds: 300, time: '17.25 - 17.30', pic: 'Pdt. Hartono L' },
    { id: '6', label: 'Nomor Spesial Gereja Cabang + Persembahan', durationInSeconds: 300, time: '17.30 - 17.35', pic: 'GSJA Bonang' },
    { id: '7', label: 'Story of GSJA + Visi Gereja Kedepan', durationInSeconds: 600, time: '17.35 - 17.45', pic: 'Team Mulmed' },
    { id: '8', label: 'Video Kesan & Pesan dari Jemaat', durationInSeconds: 300, time: '17.45 - 17.50', pic: 'Team Mulmed' },
    { id: '9', label: 'Pemotongan Tumpeng + Doa buat Gereja', durationInSeconds: 900, time: '17.50 - 18.05', pic: 'ibu Ester' },
    { id: '10', label: 'Penyerahan Tanda Kenangan', durationInSeconds: 300, time: '18.05 - 18.10', pic: 'Pdt. Hartono L + Yohanes' },
    { id: '11', label: 'Doa Penutup', durationInSeconds: 300, time: '18.10 - 18.15', pic: 'Pdt. Hartono L' },
  ]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0); // First event selected by default
  const [notes, setNotes] = useState<string>('');
  const [showNotesInOverlay, setShowNotesInOverlay] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOverlayMode(false);
      }
      if (e.key === ' ' && !showSettings && !isOverlayMode && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        setIsRunning((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, isOverlayMode]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  
  const getTargetDate = useCallback((timeStr?: string) => {
    if (!timeStr) return null;
    const parts = timeStr.split('-');
    const endTimeStr = parts.length >= 2 ? parts[1].trim() : parts[0].trim(); 
    const timeRegex = /(\d{1,2})[\.:](\d{2})/;
    const match = endTimeStr.match(timeRegex);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    }
    return null;
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (countdownMode === 'targetTime' && currentEventIndex >= 0 && events[currentEventIndex]) {
      const target = getTargetDate(events[currentEventIndex].time);
      if (target) {
        setTimeLeft(Math.ceil((target.getTime() - Date.now()) / 1000));
        return;
      }
    }
    if (currentEventIndex >= 0 && events[currentEventIndex]) {
      setTimeLeft(events[currentEventIndex].durationInSeconds);
    } else {
      setTimeLeft(inputMinutes * 60 + inputSeconds);
    }
  }, [currentEventIndex, events, inputMinutes, inputSeconds, countdownMode, getTargetDate]);

  useEffect(() => {
    if (countdownMode === 'targetTime' && currentEventIndex >= 0) {
      const target = getTargetDate(events[currentEventIndex].time);
      if (target) {
        setTimeLeft(Math.ceil((target.getTime() - Date.now()) / 1000));
      }
    } else if (countdownMode === 'duration' && currentEventIndex >= 0) {
      setTimeLeft(events[currentEventIndex].durationInSeconds);
    }
  }, [countdownMode, currentEventIndex, events, getTargetDate]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (countdownMode === 'targetTime') {
          const target = getTargetDate(events[currentEventIndex]?.time);
          if (target) {
            setTimeLeft(Math.ceil((target.getTime() - Date.now()) / 1000));
            return;
          }
        }
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, countdownMode, currentEventIndex, events, getTargetDate]);

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectEvent = (index: number) => {
    setCurrentEventIndex(index);
    setTimeLeft(events[index].durationInSeconds);
    setIsRunning(false);
  };

  const nextEvent = () => {
    if (currentEventIndex < events.length - 1) {
      selectEvent(currentEventIndex + 1);
    }
  };

  const prevEvent = () => {
    if (currentEventIndex > 0) {
      selectEvent(currentEventIndex - 1);
    }
  };

  const addEvent = () => {
    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Event',
      durationInSeconds: 300,
      pic: 'No PIC',
      time: '00.00-00.00'
    };
    setEvents([...events, newEvent]);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    if (currentEventIndex >= 0 && events[currentEventIndex].id === id) {
      setCurrentEventIndex(-1);
    }
  };

  const updateEventField = (id: string, field: keyof Event, value: string | number) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const adjustTime = (delta: number) => {
    setTimeLeft((prev) => prev + delta);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 overflow-auto ${isOverlayMode ? 'bg-transparent' : 'bg-neutral-950 p-6'}`}>
      
      {/* Control Bar (Top) */}
      {!isOverlayMode && (
        <div className="fixed top-6 left-6 right-6 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className={`flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors shadow-lg
                ${showSchedule ? 'border-emerald-500/50 text-emerald-400' : 'text-neutral-400'}
              `}
            >
              <List className="w-4 h-4" />
              Schedule
            </button>
          </div>
          
          <button
            onClick={() => setIsOverlayMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors shadow-xl"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            OBS Overlay Mode
          </button>
        </div>
      )}

      {/* Main Layout Container */}
      <div className={`flex flex-col md:flex-row items-center justify-center gap-8 w-full h-full max-w-[95vw] mx-auto ${isOverlayMode ? '' : 'mt-16'}`}>
        
        {/* Left Side: Schedule (Desktop) */}
        {!isOverlayMode && showSchedule && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 h-[500px] bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-[32px] p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Live Schedule</h3>
              <button 
                onClick={addEvent}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
              >
                + ADD SEGMENT
              </button>
            </div>
            <div className="flex justify-between items-center bg-neutral-950 p-1 rounded-lg">
              <button 
                onClick={() => setCountdownMode('duration')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${countdownMode === 'duration' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                DURATION MODE
              </button>
              <button 
                onClick={() => setCountdownMode('targetTime')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${countdownMode === 'targetTime' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                TARGET TIME MODE
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {events.map((event, idx) => (
                <div 
                  key={event.id}
                  className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                    ${currentEventIndex === idx 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-neutral-950/50 border-neutral-800/50 hover:border-neutral-700'}
                  `}
                  onClick={() => selectEvent(idx)}
                >
                    <div className="flex flex-col gap-1 pr-8 w-full">
                      <div className="flex justify-between items-start gap-2">
                        <input 
                          className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-full"
                          value={event.label}
                          onChange={(e) => updateEventField(event.id, 'label', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-[10px] font-mono whitespace-nowrap text-emerald-500/80 font-bold">
                          {event.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-neutral-500">
                        <input 
                          className="bg-transparent border-none p-0 focus:ring-0 w-2/3 italic"
                          value={event.pic || ''}
                          placeholder="No PIC"
                          onChange={(e) => updateEventField(event.id, 'pic', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-mono">
                          {Math.floor(event.durationInSeconds / 60)}m {event.durationInSeconds % 60}s
                        </span>
                      </div>
                    </div>
                  {currentEventIndex === idx && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeEvent(event.id); }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={prevEvent} className="flex-1 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 hover:bg-neutral-800"><ChevronLeft className="mx-auto w-4 h-4"/></button>
              <button onClick={nextEvent} className="flex-1 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 hover:bg-neutral-800"><ChevronRight className="mx-auto w-4 h-4"/></button>
            </div>
          </motion.div>
        )}

        {/* Center: Timer Display */}
        <motion.div layout className="relative z-10 select-none flex flex-col items-center px-4 shrink-0">
          {isOverlayMode && currentEventIndex >= 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1 mb-[-1vh]"
            >
              <div className="text-[2.5vw] font-bold text-neutral-100 uppercase tracking-[0.2em] text-center">
                {events[currentEventIndex].label}
              </div>
              <div className="flex gap-4 text-[1vw] font-bold text-emerald-500/80 uppercase tracking-widest">
                {events[currentEventIndex].pic && <span>PIC: {events[currentEventIndex].pic}</span>}
                {events[currentEventIndex].time && <span>TIME: {events[currentEventIndex].time}</span>}
              </div>
            </motion.div>
          )}

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-mono font-bold leading-none tabular-nums transition-all duration-300
              ${isOverlayMode ? 'text-[15vw]' : 'text-[20vw]'}
              ${timeLeft < 0 ? 'animate-blink-red' : 'text-neutral-100'}
            `}
          >
            {formatTime(timeLeft)}
          </motion.h1>
          
          {timeLeft < 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-red-500 font-sans font-bold uppercase tracking-widest ${isOverlayMode ? 'text-[2vw]' : 'text-lg md:text-3xl'}`}
            >
              Overtime
            </motion.div>
          )}
        </motion.div>

        {/* Right Side: Overlay Notes */}
        {isOverlayMode && showNotesInOverlay && notes && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-[25vw] text-left bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-[24px] backdrop-blur-md shadow-2xl mt-4 md:mt-0"
          >
            <div className="text-[1.5vw] text-left text-neutral-200 leading-snug font-medium whitespace-pre-wrap">
              {notes}
            </div>
          </motion.div>
        )}

        {/* Right Side: Notes (Desktop) */}
        {!isOverlayMode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 h-[500px] bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-[32px] p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <StickyNote className="w-3 h-3" />
                Stream Notes
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-600">OVERLAY</span>
                <button 
                  onClick={() => setShowNotesInOverlay(!showNotesInOverlay)}
                  className={`w-8 h-4 rounded-full transition-colors relative border ${showNotesInOverlay ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-neutral-800 border-neutral-700'}`}
                >
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-transform ${showNotesInOverlay ? 'translate-x-4.5 bg-emerald-400' : 'translate-x-0.5 bg-neutral-500'}`} />
                </button>
              </div>
            </div>
            <textarea
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-300 focus:border-emerald-500/50 focus:outline-none transition-colors resize-none leading-relaxed placeholder:text-neutral-700"
              placeholder="Paste your talking points or script here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </motion.div>
        )}
      </div>

      {/* Main Controls Overlay */}
      <AnimatePresence>
        {!isOverlayMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 mt-12 flex flex-col items-center gap-8 w-full max-w-2xl"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all active:scale-95 group"
                title="Reset"
              >
                <RotateCcw className="w-8 h-8 text-neutral-400 group-hover:rotate-[-45deg] transition-transform" />
              </button>

              <button
                onClick={prevEvent}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all active:scale-95 text-neutral-500"
                title="Previous Segment"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`p-6 rounded-3xl transition-all active:scale-95 shadow-2xl flex items-center justify-center
                  ${isRunning ? 'bg-red-500/10 border-2 border-red-500/50 hover:bg-red-500/20' : 'bg-emerald-500 border-none hover:bg-emerald-400'}
                `}
              >
                {isRunning ? <Pause className="w-10 h-10 text-red-500 fill-red-500" /> : <Play className="w-10 h-10 text-neutral-950 fill-neutral-950 ml-1" />}
              </button>

              <button
                onClick={nextEvent}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all active:scale-95 text-neutral-500"
                title="Next Segment"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:bg-neutral-800 transition-all
                  ${showSettings ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                `}
              >
                <Settings className={`w-8 h-8 ${showSettings ? 'text-emerald-400' : 'text-neutral-400'}`} />
              </button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-[32px] shadow-2xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2"><Settings className="w-3 h-3" /> Custom Time</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] text-neutral-600 font-mono">MINUTES</label>
                          <input type="number" value={inputMinutes} onChange={(e) => setInputMinutes(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-2xl font-mono focus:border-emerald-500/50 focus:outline-none"/>
                        </div>
                        <span className="text-2xl mt-6 text-neutral-700">:</span>
                        <div className="flex-1">
                          <label className="text-[10px] text-neutral-600 font-mono">SECONDS</label>
                          <input type="number" value={inputSeconds} onChange={(e) => setInputSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-2xl font-mono focus:border-emerald-500/50 focus:outline-none"/>
                        </div>
                      </div>
                      <button onClick={() => { setCurrentEventIndex(-1); resetTimer(); }} className="w-full bg-neutral-100 text-neutral-950 font-bold py-3 rounded-xl hover:bg-white">Apply Custom</button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2"><Layout className="w-3 h-3" /> Quick Adjust</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 5, 10, 15, 30, 60].map((mins) => (
                          <button key={mins} onClick={() => { setInputMinutes(mins); setInputSeconds(0); setCurrentEventIndex(-1); setTimeLeft(mins * 60); setIsRunning(false); }} className="py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors">{mins}m</button>
                        ))}
                      </div>
                      <div className="pt-2 flex gap-2">
                        <button onClick={() => adjustTime(-30)} className="flex-1 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"><Minus className="w-4 h-4" /> 30s</button>
                        <button onClick={() => adjustTime(30)} className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> 30s</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Mode Handling */}
      {isOverlayMode && (
        <div 
          onClick={() => setIsOverlayMode(false)}
          className="fixed inset-0 cursor-pointer z-0"
          title="Click to escape overlay"
        />
      )}
    </div>
  );
}

