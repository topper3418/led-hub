import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { LedCard } from "../ledStrip/ledCard";
import { Device } from "../types";
import { useAllStrips } from "../ledStrip/hooks";
import { BACKEND_ROOT_URL } from "../config";
import { getLogger } from "../logging";

const logger = getLogger('views/devices');

export const Devices: React.FC = () => {
    const navigate = useNavigate();

    const url = BACKEND_ROOT_URL;
    const { state: { data, loading, error } } = useAllStrips(url);

    useEffect(() => {
        if (!loading) {
            logger.infop('data loaded:', data);
        }
    }, [loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading data</div>;
    }

    const navToDevice = (data: Device) => {
        navigate(`/${data.name}`);
    }

    return (
        <div className="wrapper spaced">
            <header className="App-header">
                <h1>Devices</h1>
            </header>
            {loading ? <div>Loading...</div> :
             !loading && error ? <div>Error loading data</div> :
             !loading && data.length === 0 ? <div>No devices found</div> :
                <div className="deviceContainer">
                {data.map((data: Device) => (
                    <LedCard
                        key={data.name}
                        ledStrip={data}
                        selectDevice={() => navToDevice(data)}
                    />
                ))}
            </div>}
        </div>
    );

}
