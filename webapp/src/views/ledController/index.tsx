import { useNavigate, useParams } from "react-router-dom";
import Banner from '../../components/banner.tsx';
import { getLogger } from "../../logging.ts";
import React, { CSSProperties } from "react";
import ColorWheel, { RGB } from "../../components/colorWheel";
import { useLedStripHooks } from "./hooks.ts";
import { getDeviceIdentifier } from "../../util.ts";


const logger = getLogger('views/ledController');
const LedController: React.FC = () => {
  const deviceId = Number(useParams<{ deviceId: string }>().deviceId)
  const navigate = useNavigate();
  const {
    fetchState: { data: device, loading, error },
    api
  } = useLedStripHooks(deviceId, navigate);

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
    api.update({ ...color })
  }

  const displayColor = `rgba(${device?.led_strip?.red}, ${device?.led_strip?.green}, ${device?.led_strip?.blue}, ${device?.led_strip?.brightness || 0 / 10})`;

  const coloredButton = {
    backgroundColor: device?.led_strip?.on ? 'black' : displayColor,
    textShadow: '1px 1px 2px black, 0 0 25px black, 0 0 5px black'
  }

  console.log('device', device);

  return (
    <div className="flex flex-col items-stretch p-2 gap-2 bg-slate-900 h-full place-content-between p-10">
      <Banner
        loading={loading}
        title={device ? getDeviceIdentifier(device) : "Loading..."}>
        <button
          onClick={() => navigate("/")}
          className="bg-slate-800 text-slate-100 p-3 rounded-md">
          Back
        </button>
        <button
          onClick={() => navigate(`/devices/${deviceId}/config`)}
          className="bg-slate-800 text-slate-100 p-3 rounded-md h-12">
          <span className="text-4xl leading-none relative" style={{
            lineHeight: 0,
            top: "6px"
          } as CSSProperties}>
            &#9881;
          </span>
        </button>
      </Banner>
      <div className='flex flex-row justify-center items-center'>
        <ColorWheel onChange={colorChanged} />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={device?.led_strip?.brightness}
        onChange={brightnessChanged} />
      <button onClick={togglePressed} className="bg-slate-800 text-slate-100 p-3 rounded-md" style={coloredButton}>
        {device?.led_strip?.on ? 'Off' : 'On'}
      </button>
    </div>
  )
}

export default LedController
