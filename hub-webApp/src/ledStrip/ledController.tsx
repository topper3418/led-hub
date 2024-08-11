import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import ColorWheel, { RGB } from '../components/colorWheel';
import Banner from '../components/banner';
import { useLedStripHooks } from "./hooks";
import '../App.css'
// simple webpage
// has a simple button for on/off 
// has a slider for brightness
// has a color picker for color
const host = import.meta.env.VITE_SERVER_HOST;
const port = import.meta.env.VITE_SERVER_PORT;
const LedController = ({ stripName }: { stripName: string }) => {
  const url = `http://${host}:${port}/` + stripName
  const {
    state: { data, loading, error },
    api: { refetch, update }
  } = useLedStripHooks(url);
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }

  const togglePressed = () => {
    update({ on: !data.on })
  }

  const brightnessChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ brightness: parseInt(e.target.value) });
  }

  const colorChanged = (color: RGB) => {
    update({ color })
  }

  const displayColor = `rgba(${data?.color.r}, ${data?.color.g}, ${data?.color.b}, ${data?.brightness / 10})`;

  const coloredBackground = {
    backgroundColor: data.on ? displayColor : 'black',
  }

  const coloredButton = {
    backgroundColor: data.on ? 'black' : displayColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  }

  return (      
    <div className="wrapper view column bottom" style={coloredBackground}>
      <Banner title='LED control'>
        <button 
          onClick={() => navigate('/')}> 
          Back
        </button>
      </Banner>
      <div className="spaced column">
        <div className='center'>
          <ColorWheel
            color={data.color}
            onChange={colorChanged} />
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={data.brightness}
          onChange={brightnessChanged} />
        <button onClick={togglePressed} style={coloredButton}>
          { data.on ? 'Off' : 'On' }
        </button>
      </div>
    </div>
  )
}

export default LedController
