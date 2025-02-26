import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LedController from "./views/ledController";
import { Devices } from "./views/devices";
import DeviceConfigurator from "./views/ledController/configurator";

// the interior of a room is the new main view
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:roomId/devices/:deviceId/config" element={<DeviceConfigurator />} />
                <Route path="/:roomId/devices/:deviceId" element={<LedController />} />
                <Route path="/:roomId/config" element={<p>Implement this</p>} />
                <Route path="/:roomId/" element={<Devices />} />
                <Route path="/" element={<p>Implement this</p>} />
            </Routes>
        </Router>
    )
}

export default App;
