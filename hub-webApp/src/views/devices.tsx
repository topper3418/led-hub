import { useNavigate } from "react-router-dom";
import "../App.css";
import { LedCard } from "../ledStrip/ledCard";
import { Device } from "../types";
import { useAllStrips } from "../ledStrip/hooks";

export const host = import.meta.env.VITE_SERVER_HOST;
export const port = import.meta.env.VITE_SERVER_PORT;

export const Devices: React.FC = () => {
    const navigate = useNavigate();

    const url = `http://${host}:${port}/`;
    const { state: { devices, loading, error } } = useAllStrips(url);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data</div>;
    }

    const navToDevice = (device: Device) => {
        navigate(`/${device.name}`);
    }

    return (
        <div className="wrapper spaced">
            <header className="App-header">
                <h1>Devices</h1>
            </header>
            <div className="deviceContainer">
                {devices.map((device : Device) => (
                    <LedCard
                        key={device.name}
                        ledStrip={device}
                        selectDevice={() => navToDevice(device)}
                    />
                ))}
            </div>
        </div>
    );

}
