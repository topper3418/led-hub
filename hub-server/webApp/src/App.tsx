import { useState } from 'react'
import { SketchPicker } from 'react-color';
import './App.css'
// simple webpage
// has a simple button for on/off
// has a slider for brightness
// has a color picker for color
function App() {
  const [color, setColor] = useState({ r: 171, g: 37, b: 103 });
  const [brightness, setBrightness] = useState(127);
  const [on, setOn] = useState(false);

  const handleColorChange = (color: any) => {
    setColor(color.rgb);
    console.log('color', color.rgb)
  };

  const handleBrightnessChange = (event: any) => {
    setBrightness(event.target.value);
    console.log('brightness', event.target.value)
  }

  const handleOnOff = () => {
    setOn(!on);
    console.log('on', on)
  }
  
  return (
    <div className="wrapper column">
      <header className="App-header">
        <div className="column">
          <h1>LED control</h1>
            <SketchPicker color={color} onChange={handleColorChange} />
          <input type="range" min="0" max="255" value={brightness} onChange={handleBrightnessChange} />
          <button onClick={handleOnOff}>{on ? 'Off' : 'On'}</button>
        </div>
      </header>
    </div>
  )
}

export default App
