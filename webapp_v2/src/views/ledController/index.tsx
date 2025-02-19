import { useNavigate, useParams } from "react-router-dom";
import Banner from '../../components/banner.tsx';
import { getLogger } from "../../logging.ts";
import React, { CSSProperties } from "react";
import ColorWheel, { RGB } from "../../components/colorWheel";
import { useLedStripHooks } from "./hooks.ts";


const logger = getLogger('views/ledController');
const LedController: React.FC = () => {
  const deviceId = Number(useParams<{ deviceId: string }>().deviceId)
  const {
    fetchState: { data: device, loading, error },
    api
  } = useLedStripHooks(deviceId);
  const navigate = useNavigate();

  if (error) {
    return <div>Error loading data</div>
  }

  const togglePressed = () => {
    logger.debugp('toggle pressed');
    api.update({ on: !device?.led_strip?.on });
  }

  const brightnessChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.debug('brightness changed', { brightness: e.target.value });
    api.update({ brightness: parseInt(e.target.value) });
  }

  const colorChanged = (color: RGB) => {
    logger.debug('color changed', { color });
    api.update({ color })
  }

  const displayColor = `rgba(${device?.led_strip?.color?.r}, ${device?.led_strip?.color?.g}, ${device?.led_strip?.color?.b}, ${device?.led_strip?.brightness || 0 / 10})`;

  const coloredButton = {
    backgroundColor: device?.led_strip?.on ? 'black' : displayColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  }

  const BackButton = () => <button onClick={() => navigate("/")}>Back</button>;

  const DeleteButton = () => <button onClick={api.delete}>Delete</button>;

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    height: "100vh",
    backgroundColor: device?.led_strip?.on ? displayColor : 'black',
    padding: "10px",
    gap: "10px"
  }


  return (
    <div style={wrapperStyle}>
      <Banner
        loading={loading}
        title={device?.name || "unknown device"}>
        <BackButton />
        <DeleteButton />
      </Banner>
      <div className='center'>
        <ColorWheel onChange={colorChanged} />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={device?.led_strip?.brightness}
        onChange={brightnessChanged} />
      <button onClick={togglePressed} style={coloredButton}>
        {device?.led_strip?.on ? 'Off' : 'On'}
      </button>
    </div>
  )
}

export default LedController
