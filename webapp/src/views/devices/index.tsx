import React from "react";
import { useNavigate } from "react-router-dom";
import { LedCard } from "./ledCard";
import { Device } from "../../types";
import Banner from "../../components/banner";
import { useAllLedStrips } from "./hooks";


export const Devices: React.FC = () => {
    const navigate = useNavigate();

    const { state: devices, api: { refetch } } = useAllLedStrips();
    // const { state: setAllState, api: { setAll } } = useSetAll();

    if (devices.error) {
        return (<>
            <p>Error loading data</p>
            <pre>{devices.error}</pre>
        </>)
    }

    // if (setAllState.error) {
    //     return (<>
    //         <p>Error setting all</p>
    //         <pre>{setAllState.error}</pre>
    //     </>)
    // }
    //
    const navToDevice = (data: Device) => {
        navigate(`/devices/${data.id}`);
    }

    return (
        <div className="p-10 flex flex-col h-full w-full gap-2 bg-slate-900">
            <Banner title="All LEDs" loading={devices.loading}>
                <></>
                <></>
            </Banner>
            <div className="flex flex-col gap-2 items-stretch overflow-y-auto">
                {!devices.loading && devices.data?.length === 0 ? <div>No devices found</div> :
                    devices.data?.map((item: Device) => (
                        <LedCard
                            key={item.name}
                            device={item}
                            selectDevice={() => navToDevice(item)}
                            refetch={refetch}
                        />
                    ))}
            </div>
        </div>
    );

}
