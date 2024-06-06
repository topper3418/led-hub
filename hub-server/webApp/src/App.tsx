import { useState, useEffect } from 'react'
import { Router } from 'react-router-dom'
// import { SketchPicker } from 'react-color';
import ColorWheel, { RGB } from './colorwheel';
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
  const [write, setWrite] = useState(false);

  const url = 'http://DESKTOP-KTV4KV6.local:2000/stripData/' + stripName

  // get and post requests return the same data, so lets process them the same
  const processResponse = async (res: Response, write=false) => {
    const data = await res.json();
    console.log('data returned from request', data);
    const [r, g, b] = data.color;
    setWrite(write)
    setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
    setOn(data.on);
    setBrightness(data.brightness);
  }

  useEffect(() => {
    setLoading(true);
    fetch(url).then(processResponse).catch(err => {
      setError(true);
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const togglePressed = () => {
    setWrite(true);
    setOn(!on)
  }

  const brightnessChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWrite(true);
    setBrightness(parseInt(e.target.value));
  }

  const colorChanged = (color: RGB) => {
    setWrite(true);
    setColor(color);
  }

  useEffect(() => {
    if (write) sendChange();
  }, [color, on, brightness]);

  const sendChange = async () => {
    console.log('sending change', {color, on, brightness})
    try {
      const postData = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          color,
          on,
          brightness
        })
      });
      processResponse(postData);
    } catch (err) {
      console.error(err);
    }
  }

  const coloredBackground = {
    backgroundColor: on ? `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness / 10})` : 'black',
  }

  const coloredButton= {
    backgroundColor: on ? 'black' : `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness / 10})`,
  }

  console.log('colored background', coloredBackground)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }
  
  return (
    <div className="wrapper column bottom" style={coloredBackground}>
        <div className="view spaced column">
          <h1>LED control</h1>
          <div className='center'>
            <ColorWheel 
              color={color} 
              onChange={colorChanged} />
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            value={brightness} 
            onChange={brightnessChanged} />
          <button onClick={togglePressed} style={coloredButton}>
            {on ? 'Off' : 'On'}
            </button>
        </div>
    </div>
  )
}

export default App
