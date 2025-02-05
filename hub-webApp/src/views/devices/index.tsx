import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LedCard } from "../../ledStrip/ledCard";
import { Device } from "../../types";
import { BACKEND_ROOT_URL } from "../../config";
import { getLogger } from "../../logging";
import Banner from "../../components/banner";
import { useAllLedStrips, useSetAll } from "./hooks";

const logger = getLogger('views/devices');

export const Devices: React.FC = () => {
    const navigate = useNavigate();

    const queryUrl = BACKEND_ROOT_URL;
    const { state: devices, api: { refetch } } = useAllLedStrips(queryUrl);
    const setAllUrl = BACKEND_ROOT_URL + 'all';
    const { state: setAllState, api: { setAll } } = useSetAll(setAllUrl);

    if (devices.error) {
        return (<>
            <p>Error loading data</p>
            <pre>{devices.error}</pre>
        </>)
    }

    if (setAllState.error) {
        return (<>
            <p>Error setting all</p>
            <pre>{setAllState.error}</pre>
        </>)
    }


    const navToDevice = (data: Device) => {
        navigate(`/${data.name}`);
    }
    // for determining the state of the allOn button
    const allOn = devices.data?.every((d: Device) => d.on || !d.connected);

    return (
        <div className="wrapper spaced">
            <Banner title="All LEDs" loading={devices.loading}>
                <></>
                <button onClick={() => setAll(!allOn)}>{allOn ? "All off" : "All on"}</button>
            </Banner>
            {!devices.loading && devices.data.length === 0 ? <div>No devices found</div> :
                <div className="deviceContainer">
                    {devices.data?.map((data: Device) => (
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
