import React from 'react';
import { useAutoMode } from '../../context/AutoModeContext';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Compass
} from 'lucide-react';

export const AutoPilotController = () => {
  const {
    isAutoMode,
    toggleAutoMode,
    stages,
    currentStage,
    currentStageIndex,
    isPlaying,
    togglePlay,
    nextStage,
    prevStage,
    goToStage,
    countdown,
    isMinimized,
    setIsMinimized
  } = useAutoMode();

  if (!isAutoMode) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/90 dark:bg-white/90 text-white dark:text-black font-semibold text-[13px] shadow-xl backdrop-blur-xl border border-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#34c759] animate-ping" />
          <span className="w-2 h-2 rounded-full bg-[#34c759] -ml-4" />
          <span>Auto Mode: Stage {currentStageIndex + 1}/6</span>
          <Maximize2 className="w-3.5 h-3.5 ml-1 opacity-70" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Interactive Auto-Pilot Workflow Tour Controller"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-[940px] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="p-3 sm:p-4 rounded-2xl bg-white/92 dark:bg-[#121214]/92 backdrop-blur-2xl border border-black/[0.12] dark:border-white/[0.14] shadow-2xl shadow-black/20 text-[#1d1d1f] dark:text-[#f5f5f7]">
        {/* Top bar with mode badge, current title and controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] font-bold text-[11px] tracking-wide uppercase border border-[#34c759]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
              Auto Mode: ON
            </span>
            <div className="flex items-center gap-1 text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
              <span className="text-[#0071e3] dark:text-[#2997ff]">
                Stage {currentStage.number} of 6:
              </span>
              <span>{currentStage.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto Play / Pause with Countdown */}
            <button
              onClick={togglePlay}
              className={`h-7.5 sm:h-8 px-3 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isPlaying
                  ? 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30'
                  : 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause ({countdown}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>

            {/* Prev / Next */}
            <button
              onClick={prevStage}
              title="Previous Stage"
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-black/[0.06] dark:border-white/[0.08] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextStage}
              title="Next Stage"
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-black/[0.06] dark:border-white/[0.08] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize Controller"
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Stage Stepper Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 pt-2.5">
          {stages.map((st, idx) => {
            const isActive = idx === currentStageIndex;
            const isCompleted = idx < currentStageIndex;

            return (
              <button
                key={st.id}
                onClick={() => goToStage(idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-[11.5px] transition-all border ${
                  isActive
                    ? 'bg-[#0071e3] text-white border-[#0071e3] font-semibold shadow-sm scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#34c759]/10 text-[#1b7e36] dark:text-[#30d158] border-[#34c759]/25 hover:bg-[#34c759]/15'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] border-black/[0.05] dark:border-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                }`}
              >
                <span className="truncate">{st.shortName}</span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-1 shrink-0" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-[#34c759] ml-1 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Dynamic Contextual Stage Description */}
        <div className="hidden sm:flex items-center justify-between text-[11.5px] text-[#6e6e73] dark:text-[#86868b] pt-2 mt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
          <span className="truncate mr-3">
            <span className="font-medium text-[#1d1d1f] dark:text-white">Workflow Logic:</span>{' '}
            {currentStage.description}
          </span>
          <span className="shrink-0 font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06]">
            Role: {currentStage.tag}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AutoPilotController;
