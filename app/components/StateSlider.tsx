"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface StateSliderProps {
  totalStates: number;
  currentState: number;
  onStateChange: (state: number) => void;
  stateLabels?: string[];
}

export default function StateSlider({
  totalStates,
  currentState,
  onStateChange,
  stateLabels,
}: StateSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getStateFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return currentState;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = x / rect.width;
      const state = Math.round(percentage * (totalStates - 1));
      return Math.max(0, Math.min(totalStates - 1, state));
    },
    [totalStates, currentState]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      const newState = getStateFromPosition(e.clientX);
      onStateChange(newState);
    },
    [getStateFromPosition, onStateChange]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newState = getStateFromPosition(e.clientX);
      onStateChange(newState);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, getStateFromPosition, onStateChange]);

  const percentage = totalStates > 1 ? (currentState / (totalStates - 1)) * 100 : 0;

  return (
    <div
      className="w-full px-6 py-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-primary)",
      }}
    >
      {/* State indicator */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          State {currentState + 1} of {totalStates}
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {stateLabels?.[currentState] || `Intermediate ${currentState}`}
        </span>
      </div>

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="relative h-2 cursor-pointer rounded-full"
        style={{ backgroundColor: "var(--bg-elevated)" }}
        onMouseDown={handleMouseDown}
      >
        {/* Filled track */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: "var(--accent)",
          }}
        />

        {/* State markers */}
        <div className="absolute inset-0 flex items-center justify-between px-0">
          {Array.from({ length: totalStates }).map((_, i) => {
            const markerPercentage = totalStates > 1 ? (i / (totalStates - 1)) * 100 : 0;
            const isActive = i <= currentState;
            const isCurrent = i === currentState;
            return (
              <button
                key={i}
                className="absolute h-3 w-3 -translate-x-1/2 rounded-full transition-all"
                style={{
                  left: `${markerPercentage}%`,
                  backgroundColor: isActive
                    ? "var(--accent)"
                    : "var(--bg-tertiary)",
                  border: isCurrent
                    ? "2px solid var(--text-primary)"
                    : "2px solid transparent",
                  transform: `translateX(-50%) scale(${isCurrent ? 1.3 : 1})`,
                }}
                onClick={() => onStateChange(i)}
              />
            );
          })}
        </div>

        {/* Thumb */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full shadow-lg transition-transform"
          style={{
            left: `${percentage}%`,
            transform: `translateX(-50%) translateY(-50%) scale(${isDragging ? 1.2 : 1})`,
            backgroundColor: "var(--text-primary)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
      </div>

      {/* Labels below slider */}
      <div className="mt-3 flex justify-between">
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          UI 1
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          UI 2
        </span>
      </div>
    </div>
  );
}
