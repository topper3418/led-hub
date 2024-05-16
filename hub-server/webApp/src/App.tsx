import { useState } from 'react'
import './App.css'
// simple webpage
// has a simple button for on/off
// has a slider for brightness
// has a color picker for color
function App() {
  
  return (
    <div className="root">
      <header className="App-header">
        <h1>LED control</h1>
        <input type="color" />
        <input type="range" min="0" max="255" />
        <button>On/Off</button>
      </header>
    </div>
  )
}

export default App
