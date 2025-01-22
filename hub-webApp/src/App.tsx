import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LedController from "./views/ledController";
import LogView from "./views/logView";
import { Devices } from "./views/devices";


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:deviceName" element={<LedController />} />
                <Route path="/" element={<Devices />} />
                <Route path="/logview" element={<LogView />} />
            </Routes>
        </Router>
    )
}

export default App;
