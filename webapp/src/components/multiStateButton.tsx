import React, { CSSProperties } from 'react';
import { getContrastColor } from '../util';

interface MultiStateButtonProps {
  options: string[];
  clicked: string;
  setClicked: (value: string) => void;
  selectedColor?: string;
  loading?: boolean;
}

export const MultiStateButton: React.FC<MultiStateButtonProps> = (
  { options, clicked, setClicked, selectedColor, loading }
) => {
  const newSelectedColor = selectedColor || '#FFFFFF';
  const contrastColor = getContrastColor(newSelectedColor);
  const containerStyle: CSSProperties = {};
  if (loading) containerStyle.borderColor = 'yellow';
  return (
    <div className="flex flex-row border border-slate-200 rounded-sm gap-1 bg-slate-700" style={containerStyle}>
      {options.map(option => {
        const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation()
          setClicked(option)
        }
        const buttonClass = "flex-1 rounded-sm text-slate-100 size-12";
        return (
          <button
            className={buttonClass}
            style={(clicked === option ? {
              backgroundColor: newSelectedColor,
              color: contrastColor,
            } : {}) as CSSProperties}
            key={option}
            onClick={onClick}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
