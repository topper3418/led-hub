// import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import ColorWheel, { RGB } from '../components/colorWheel';
import Banner from '../components/banner';
import { useLedStripHooks } from "./hooks";
import { hostUrl } from "../config";
import '../App.css'
// simple webpage
// has a simple button for on/off 
// has a slider for brightness
// has a color picker for color
const LedController = ({ stripName }: { stripName: string }) => {
  const url = hostUrl + stripName
  const {
    state: { devices, loading, error },
    api: { update }
  } = useLedStripHooks(url);
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }

  const togglePressed = () => {
    update({ on: !devices.on })
  }

  const brightnessChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ brightness: parseInt(e.target.value) });
  }

  const colorChanged = (color: RGB) => {
    update({ color })
  }

  const displayColor = `rgba(${devices?.color.r}, ${devices?.color.g}, ${devices?.color.b}, ${devices?.brightness / 10})`;

  const coloredBackground = {
    backgroundColor: devices.on ? displayColor : 'black',
  }

  const coloredButton = {
    backgroundColor: devices.on ? 'black' : displayColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  }

  const BackButton = () => <button onClick={() => navigate("/")}>Back</button>;

  return (
    <div className="wrapper view column bottom" style={coloredBackground}>
      <Banner title='LED control'>
        <BackButton />
      </Banner>
      <div className="spaced column">
        <div className='center'>
          <ColorWheel
            color={devices.color}
            onChange={colorChanged} />
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={devices.brightness}
          onChange={brightnessChanged} />
        <button onClick={togglePressed} style={coloredButton}>
          {devices.on ? 'Off' : 'On'}
        </button>
      </div>
    </div>
  )
}

export default LedController
