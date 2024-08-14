import React from 'react';
import '../App.css'

interface MultiStateButtonProps {
  options: string[];
  clicked: string;
  setClicked: (value: string) => void;
  selectedColor?: string;
}

export const MultiStateButton: React.FC<MultiStateButtonProps> = (
  { options, clicked, setClicked, selectedColor }
) => {
  const newSelectedColor = selectedColor || '#4287f5';
  const selectedStyle = {
    backgroundColor: newSelectedColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  };
  return (
    <div className="row">
      {options.map(option => {
        const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation()
          console.log(`internally setting to ${option}`)
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
        )})}
    </div>
  )
}
