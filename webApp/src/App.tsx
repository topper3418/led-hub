// import { Router } from 'react-router-dom';
import { useEffect, useState } from 'react';

const host = import.meta.env.VITE_SERVER_HOST;
const port = import.meta.env.VITE_SERVER_PORT;

interface Device {
  id: number;
  mac: string;
  name: string;
  current_ip: string;
}

interface ledCardInterface {
  ledStrip: Device;
  selectDevice: (device: Device) => void;
}


export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [color, setColor] = useState({ r: 171, g: 37, b: 103 });
  const [on, setOn] = useState(false);
  const [brightness, setBrightness] = useState(255);

  const url = `http://${host}:${port}/` + ledStrip.name

  useEffect(() => {
    console.log('loading data for device', ledStrip);
    setLoading(true);
    fetch(url).then((res: Response) => {
      if (!res.ok) {
        throw new Error('Request failed, status: ' + res.status + ' ' + res.statusText);
      }
      return res.json();
    }).then(data => {
      console.log('data returned from request', data);
      const [r, g, b] = data.color;
      setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
      setOn(data.on);
      setBrightness(Math.round(data.brightness * 10 / 255));  // convert 0-255 to 0-10 and round to the nearest integer
    }).catch(err => {
      setError(true);
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const colorIndicator = `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness / 10})`;
  const indicatorClass = `indicator ${on ? 'radiant-border' : ''}`;

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }

  // Rest of the code...
  return (
    <div className="deviceTile" onClick={()=>selectDevice(ledStrip)}>
      <div className="name">{ledStrip.name}</div>
      <div className={indicatorClass} style={{backgroundColor: colorIndicator}}></div>
    </div>
  );
}


function App() {
  const [data, setData] = useState<Device[]>([]); // data is an array of Device objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const url = `http://${host}:${port}/`

  useEffect(() => {
    setLoading(true);
    fetch(url).then((res: Response) => {
      console.log('processing response');
      if (!res.ok) {
        throw new Error('Request failed, status: ' + res.status + ' ' + res.statusText);
      }
      return res.json();
    }).then(data => {
      console.log('data returned from request', data);
      setData(data);
    }).catch(err => {
      setError(true);
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data</div>
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Devices</h1>
      </header>
      <div className="deviceContainer">
        {data.map((device) => <LedCard key={device.id} ledStrip={device} selectDevice={() => console.log('selected device', device)} />)}
      </div>
    </div>
  );
}

export default App
 