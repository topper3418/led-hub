// import { Router } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Route, Routes, useParams, useNavigate, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import LedControllerElement from "./ledStrip/ledController";
import { LedCard } from "./ledStrip/ledCard";
import { Device } from "./types";
import { Devices } from "./views/devices";

export const host = import.meta.env.VITE_SERVER_HOST;
export const port = import.meta.env.VITE_SERVER_PORT;

// wrap it to pass the params
const LedController: React.FC = () => {
  const stripName = useParams<{deviceName: string}>().deviceName;
  return <LedControllerElement stripName={stripName} />
};

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
