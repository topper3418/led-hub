import React, { CSSProperties } from 'react';
import '../App.css'

interface MultiStateButtonProps {
  options: string[];
  clicked: string;
  setClicked: (value: string) => void;
  currentColor?: string;
  loading?: boolean;
}

export const MultiStateButton: React.FC<MultiStateButtonProps> = (
  { options, clicked, setClicked, currentColor: selectedColor, loading }
) => {
  const newSelectedColor = selectedColor || '#4287f5';
  const selectedStyle = {
    backgroundColor: newSelectedColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  };
  const containerStyle: CSSProperties = {};
  if (loading) containerStyle.borderColor = 'yellow';
  return (
    <div className="flex flex-row p-1 border border-slate-200 rounded-sm gap-1" style={containerStyle}>
      {options.map(option => {
        const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation()
          setClicked(option)
        }
        return (
          <button
            className="flex-1 p-1 rounded-sm text-slate-100"
            key={option}
            onClick={onClick}
            style={option == clicked ? selectedStyle : {}}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
