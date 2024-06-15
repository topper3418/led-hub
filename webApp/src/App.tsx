import LedController from "./ledController";

function App() {

  const stripName = 'DevStrip';
  return (
    <LedController stripName={stripName} />
  )
}

export default App
