import { useEffect, useState } from "react";
import { Route, Routes, useParams, useNavigate } from "react-router-dom";
import "../App.css";
import LedControllerElement from "../ledStrip/ledController";
import { LedCard } from "../ledStrip/ledCard";
import { Device } from "../types";
import { useAllStrips } from "../ledStrip/hooks";

export const host = import.meta.env.VITE_SERVER_HOST;
export const port = import.meta.env.VITE_SERVER_PORT;

export const Devices: React.FC = () => {
    const navigate = useNavigate();

    const url = `http://${host}:${port}/`;
    const { devices, loading, error } = useAllStrips(url);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data</div>;
    }

    const navToDevice = (device: Device) => {
        console.log('navigating to', device.name);
        navigate(`/${device.name}`);
    }

    return (
        <div className="wrapper spaced">
            <header className="App-header">
                <h1>Devices</h1>
            </header>
            <div className="deviceContainer">
                {devices.map((device) => (
                    <LedCard
                        key={device.id}
                        ledStrip={device}
                        selectDevice={() => navToDevice(device)}
                    />
                ))}
            </div>
        </div>
    );

}
