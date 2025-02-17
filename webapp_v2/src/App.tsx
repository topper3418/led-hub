import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LedController from "./views/ledController";
import { Devices } from "./views/devices";


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/devices/:deviceId" element={<LedController />} />
                <Route path="/rooms/:roomId" element={<Devices />} />
                <Route path="/rooms" element={<p>Implement this</p>} />
                <Route path="/" element={<Devices />} />
            </Routes>
        </Router>
    )
}

export default App;
