import '../App.css'

interface MultiStateButtonProps {
  options: string[];
  clicked: string;
  setClicked: (value: string) => void;
  selectedColor?: string;
}

export const MultiStateButton: React.FC<MultiStateButtonProps> = (
  { options, clicked, setClicked, selectedColor='lightblue' }
) => {
  const selectedStyle = {
    backgroundColor: selectedColor
  };
  return (
    <div className="row">
      {options.map(option => {
        const onClick = (event) => {
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
