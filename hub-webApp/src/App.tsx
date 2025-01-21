// import { Router } from "react-router-dom";
// import React, { useEffect, useState } from "react";
import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LedController from "./views/ledController";
// import LogView from "./logs";
// import { LedCard } from "./ledStrip/ledCard";
// import { Device } from "./types";
import { Devices } from "./views/devices";


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:deviceName" element={<LedController />} />
                <Route path="/" element={<Devices />} />
            </Routes>
        </Router>
    )
}

export default App;
