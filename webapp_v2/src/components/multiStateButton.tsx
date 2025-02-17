import React, { CSSProperties } from 'react';
import '../App.css'

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
  const newSelectedColor = selectedColor || '#4287f5';
  const selectedStyle = {
    backgroundColor: newSelectedColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  };
  const containerStyle: CSSProperties = {};
  if (loading) containerStyle.borderColor = 'yellow';
  return (
    <div className="row" style={containerStyle}>
      {options.map(option => {
        const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation()
          setClicked(option)
        }
        return (
          <button
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
