import React, { useState, useEffect, useRef } from 'react';

interface RollingDayStepperProps {
  days: number;
  onChange: (newDays: number) => void;
  min?: number;
  max?: number;
  isAutoRolling?: boolean;
  compact?: boolean;
  className?: string;
  tooltipHint?: string;
}

export const RollingDayStepper: React.FC<RollingDayStepperProps> = ({
  days,
  onChange,
  min = 0,
  max = 999,
  isAutoRolling = false,
  compact = false,
  className = '',
  tooltipHint
}) => {
  const [prevDays, setPrevDays] = useState(days);
  const [rollDirection, setRollDirection] = useState<'up' | 'down' | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(String(days));

  // Ref to always have latest days value
  const daysRef = useRef(days);
  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  // Press-and-hold continuous rolling timer
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const wheelAccumulatorRef = useRef(0);
  const wheelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger smooth vertical rolling animation when `days` prop changes
  useEffect(() => {
    if (days !== prevDays) {
      setRollDirection(days > prevDays ? 'up' : 'down');
      setPrevDays(days);
      setEditInput(String(days));

      const timer = setTimeout(() => {
        setRollDirection(null);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [days, prevDays]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []);

  const handleStep = (delta: number) => {
    const current = daysRef.current;
    const next = Math.min(max, Math.max(min, current + delta));
    if (next !== current) {
      onChange(next);
    }
  };

  // Continuous roll on hold: only kicks in after 400ms long press
  const startHold = (delta: number) => {
    isHoldingRef.current = false;
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      holdIntervalRef.current = setInterval(() => {
        handleStep(delta);
      }, 120);
    }, 400);
  };

  const stopHold = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
  };

  // Single click handler: executes exactly once on regular click, suppressed after long press
  const handleButtonClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      return;
    }
    handleStep(delta);
  };

  // Mouse wheel rolling handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    wheelAccumulatorRef.current += e.deltaY;

    if (Math.abs(wheelAccumulatorRef.current) >= 20) {
      const delta = wheelAccumulatorRef.current > 0 ? -1 : 1;
      wheelAccumulatorRef.current = 0;
      handleStep(delta);
    }

    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = setTimeout(() => {
      wheelAccumulatorRef.current = 0;
    }, 150);
  };

  const handleCommitEdit = () => {
    setIsEditing(false);
    const num = parseInt(editInput.trim(), 10);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    } else {
      setEditInput(String(days));
    }
  };

  return (
    <div
      className={`relative inline-flex items-center rounded-lg bg-[#27150a] border border-amber-700/60 shadow-inner group/stepper select-none transition-all duration-200 ${
        isHovered ? 'border-amber-500 shadow-amber-950/40 ring-1 ring-amber-500/30' : ''
      } ${isAutoRolling ? 'ring-1 ring-amber-400 animate-pulse' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        stopHold();
      }}
      title={tooltipHint || `当前养号天数: 第 ${days} 天。支持鼠标在此上下滑动滚轮直接滚动天数，或点击 [-] [+]`}
    >
      {/* Decrement Button [-] */}
      <button
        type="button"
        onMouseDown={() => startHold(-1)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onClick={(e) => handleButtonClick(e, -1)}
        className="px-2 py-1 text-amber-400 hover:text-white hover:bg-amber-900/60 font-bold text-xs active:scale-90 transition-all border-r border-amber-800/60 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={days <= min}
        title="减少 1 天"
      >
        -
      </button>

      {/* Rolling Days Middle Display with Mouse Wheel Listener */}
      <div
        onWheel={handleWheel}
        onDoubleClick={() => setIsEditing(true)}
        className={`px-2 py-1 text-xs font-mono font-bold text-amber-300 tracking-wide text-center cursor-ns-resize hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-0.5 min-w-[58px] overflow-hidden relative ${
          compact ? 'px-1.5 min-w-[50px]' : ''
        }`}
      >
        {isEditing ? (
          <input
            type="number"
            autoFocus
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            onBlur={handleCommitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommitEdit();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditInput(String(days));
              }
            }}
            className="w-10 bg-slate-900 border border-amber-500 rounded text-center text-xs text-amber-200 font-mono focus:outline-none p-0"
          />
        ) : (
          <div className="flex items-center justify-center gap-0.5 leading-none">
            <span className="text-amber-400/90 text-[11px] font-sans">第</span>

            {/* Smooth Rolling Odometer Container */}
            <div className="relative inline-block h-4 min-w-[20px] overflow-hidden">
              <span
                key={days}
                className={`inline-block font-extrabold text-amber-200 underline decoration-amber-500/40 transition-transform duration-300 ease-out ${
                  rollDirection === 'up'
                    ? 'animate-roll-up'
                    : rollDirection === 'down'
                    ? 'animate-roll-down'
                    : ''
                }`}
              >
                {days}
              </span>
            </div>

            <span className="text-amber-400/90 text-[11px] font-sans">天</span>
          </div>
        )}
      </div>

      {/* Increment Button [+] */}
      <button
        type="button"
        onMouseDown={() => startHold(1)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onClick={(e) => handleButtonClick(e, 1)}
        className="px-2 py-1 text-amber-400 hover:text-white hover:bg-amber-900/60 font-bold text-xs active:scale-90 transition-all border-l border-amber-800/60 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={days >= max}
        title="增加 1 天"
      >
        +
      </button>

      {/* Hover Tooltip Helper */}
      {isHovered && !isEditing && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-amber-300 text-[10px] px-2 py-0.5 rounded shadow-lg border border-amber-500/30 whitespace-nowrap z-30 pointer-events-none opacity-90 transition-opacity">
          🖱️ 鼠标滚轮可直接滚动天数
        </div>
      )}
    </div>
  );
};
