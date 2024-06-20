import { useEffect, useState } from "react";
import { Route, Routes, useParams, useNavigate } from "react-router-dom";
import "../App.css";
import LedControllerElement from "../ledStrip/ledController";
import { LedCard } from "../ledStrip/ledCard";
import { Device } from "../types";

export const host = import.meta.env.VITE_SERVER_HOST;
export const port = import.meta.env.VITE_SERVER_PORT;

export const Devices: React.FC = () => {
    const [data, setData] = useState<Device[]>([]); // data is an array of Device objects
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const url = `http://${host}:${port}/`;

    useEffect(() => {
        setLoading(true);
        fetch(url)
            .then((res: Response) => {
                console.log("Processing esponse");
                if (!res.ok) {
                    throw new Error(
                        "Request failed, status: " +
                            res.status +
                            " " +
                            res.statusText
                    );
                }
                return res.json();
            })
            .then((data) => {
                console.log("data returned from request", data);
                setData(data);
            })
            .catch((err) => {
                setError(true);
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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
                {data.map((device) => (
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
