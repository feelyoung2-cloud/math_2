import React, { useEffect } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface NumericKeypadProps {
  onNumber: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onNumber,
  onDelete,
  onSubmit,
  disabled = false,
}) => {
  // Listen for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onNumber(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNumber, onDelete, onSubmit, disabled]);

  const numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-sm mx-auto p-2 select-none">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {numKeys.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => onNumber(num)}
            className="h-16 sm:h-20 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-950 font-black text-3xl sm:text-4xl rounded-2xl border-b-4 border-emerald-300 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}

        {/* Backspace / Delete button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="h-16 sm:h-20 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-800 font-extrabold text-xl sm:text-2xl rounded-2xl border-b-4 border-rose-300 shadow-md active:translate-y-1 active:border-b-0 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Delete className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-bold">지우기</span>
        </button>

        {/* 0 Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onNumber('0')}
          className="h-16 sm:h-20 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-950 font-black text-3xl sm:text-4xl rounded-2xl border-b-4 border-emerald-300 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          0
        </button>

        {/* Enter / Submit button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="h-16 sm:h-20 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-amber-950 font-black text-xl sm:text-2xl rounded-2xl border-b-4 border-amber-600 shadow-md active:translate-y-1 active:border-b-0 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CornerDownLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
          <span className="text-xs sm:text-sm font-bold">확인</span>
        </button>
      </div>
    </div>
  );
};
