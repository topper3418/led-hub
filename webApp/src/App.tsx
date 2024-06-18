import { Router } from 'react-router-dom';
import LedController from "./ledStrip/ledController";



function App() {

  const stripName = 'DevPi';
  return (
    <LedController stripName={stripName} />
  )
}

export default App
