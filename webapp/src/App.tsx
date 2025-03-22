import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LedController from "./views/ledController";
import { Devices } from "./views/devices";
import DeviceConfigurator from "./views/ledController/configurator";
import Rooms from "./views/rooms";
import RoomConfigurator from "./views/rooms/configurator";

// the interior of a room is the new main view
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:roomId/devices/:deviceId/config" element={<DeviceConfigurator />} />
                <Route path="/:roomId/devices/:deviceId" element={<LedController />} />
                <Route path="/:roomId/config" element={<RoomConfigurator />} />
                <Route path="/:roomId/" element={<Devices />} />
                <Route path="/" element={<Rooms />} />
            </Routes>
        </Router>
    )
}

export default App;
