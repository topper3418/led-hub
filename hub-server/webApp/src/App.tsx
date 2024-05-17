import { useState, useEffect } from 'react'
// import { SketchPicker } from 'react-color';
import ColorWheel from './colorwheel';
import './App.css'
// simple webpage
// has a simple button for on/off
// has a slider for brightness
// has a color picker for color

const stripName = 'devstrip';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [color, setColor] = useState({ r: 171, g: 37, b: 103 });
  const [on, setOn] = useState(false);
  const [brightness, setBrightness] = useState(255);

  const url = 'http://DESKTOP-KTV4KV6.local:2000/stripData/' + stripName

  useEffect(() => {
    setLoading(true);
    fetch(url).then(res => res.json()).then(data => {
      console.log('data', data)
      const [r, g, b] = data.color;
      console.log('parsedColor', r, g, b)
      setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
      setOn(data.on);
    }).catch(err => {
      setError(true);
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    sendChange();
  }, [color, on, brightness]);

  const sendChange = () => {
    console.log('sending change', color, on, brightness)
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        color: [color.r, color.g, color.b],
        on,
        brightness
      })
    }).then(res => {
      console.log('res', res)
    }).catch(err => {
      console.error(err);
    });
  }

  const coloredBackground = {
    backgroundColor: on ? `rgb(${color.r}, ${color.g}, ${color.b})` : 'black',
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }
  
  return (
    <div className="wrapper column" style={coloredBackground}>
        <div className="view spaced column" style={coloredBackground}>
          <h1>LED control</h1>
          <div className='center'>
            <ColorWheel 
              color={color} 
              setColor={setColor} />
          </div>
          <input 
            type="range" 
            min="0" 
            max="255" 
            value={brightness} 
            onChange={(e) => setBrightness(parseInt(e.target.value))} />
          <button onClick={() => setOn(!on)}>{on ? 'Off' : 'On'}</button>
        </div>
    </div>
  )
}

export default App
