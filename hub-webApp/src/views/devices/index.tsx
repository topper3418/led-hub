import React from "react";
import { useNavigate } from "react-router-dom";
import { LedCard } from "./ledCard";
import { Device } from "../../types";
import Banner from "../../components/banner";
import { useAllLedStrips, useSetAll } from "./hooks";

export const Devices: React.FC = () => {
    const navigate = useNavigate();

    const { state: devices, api: { refetch } } = useAllLedStrips();
    const { state: setAllState, api: { setAll } } = useSetAll();

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
            {!devices.loading && devices.data?.length === 0 ? <div>No devices found</div> :
                <div className="deviceContainer">
                    {devices.data?.map((data: Device) => (
                        <LedCard
                            key={data.name}
                            ledStrip={data}
                            selectDevice={() => navToDevice(data)}
                            refetch={refetch}
                        />
                    ))}
                </div>}
        </div>
    );

}
