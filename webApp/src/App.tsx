 import LedController from "./ledController";

function App() {

  const stripName = 'DevPi';
  return (
    <LedController stripName={stripName} />
  )
}

export default App
