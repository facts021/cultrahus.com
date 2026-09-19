import React from 'react';

interface PassQrCodeProps {
  code?: string;
  size?: number;
  className?: string;
}

// Deterministic SVG QR-like visual Matrix for authentic event credential verification
export const PassQrCode: React.FC<PassQrCodeProps> = ({ code = '', size = 110, className = '' }) => {
  const safeCode = typeof code === 'string' && code.trim().length > 0 ? code.trim() : 'SNGM-DEL-2026';

  // Simple hash for deterministic pattern based on the unique code
  const getCellState = (r: number, c: number) => {
    // Standard QR finder corners
    const isCornerFinder =
      (r < 7 && c < 7) ||
      (r < 7 && c >= 14) ||
      (r >= 14 && c < 7);

    if (isCornerFinder) {
      // 7x7 outer box, 5x5 inner white, 3x3 black center
      const inBox = (row: number, col: number) => {
        const localR = row >= 14 ? row - 14 : row;
        const localC = col >= 14 ? col - 14 : col;
        if (localR === 0 || localR === 6 || localC === 0 || localC === 6) return true;
        if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) return true;
        return false;
      };
      return inBox(r, c);
    }

    // Pseudo-random pseudo QR data cells using code char codes
    const len = Math.max(1, safeCode.length);
    const charIndex = (r * 21 + c) % len;
    const charCode = safeCode.charCodeAt(charIndex) || 65;
    const val = charCode + r * 7 + c * 13;
    return val % 2 === 0;
  };

  const cells = [];
  const matrixSize = 21;
  const cellSize = 100 / matrixSize;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (getCellState(r, c)) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="currentColor"
          />
        );
      }
    }
  }

  return (
    <div
      className={`inline-block bg-white p-2 rounded border border-amber-900/20 text-[#0b2e23] ${className}`}
      style={{ width: size, height: size }}
      title={`Security Verification QR: ${safeCode}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {cells}
      </svg>
    </div>
  );
};

export const PassBarcode: React.FC<{ code?: string }> = ({ code = '' }) => {
  const safeCode = typeof code === 'string' && code.trim().length > 0 ? code.trim() : 'SNGM-2026';
  const len = Math.max(1, safeCode.length);
  const bars = [];

  for (let i = 0; i < 48; i++) {
    const charCode = safeCode.charCodeAt(i % len) || 65;
    const isWide = (charCode + i) % 3 === 0;
    const isBlank = (charCode + i * 2) % 5 === 0;
    if (!isBlank) {
      bars.push(
        <div
          key={i}
          className="bg-current h-10"
          style={{ width: isWide ? '3px' : '1.5px', margin: '0 1px' }}
        />
      );
    } else {
      bars.push(<div key={i} style={{ width: '2px' }} />);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center overflow-hidden h-9 opacity-85">
        {bars}
      </div>
      <span className="text-[10px] font-mono tracking-widest uppercase mt-1 opacity-70">
        {safeCode}
      </span>
    </div>
  );
};
