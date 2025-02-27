import React, { CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LedCard } from "./ledCard";
import { Device } from "../../types";
import Banner from "../../components/banner";
import { useFetchRoom } from "./hooks";


export const Devices: React.FC = () => {
    const roomId = Number(useParams<{ roomId: string }>().roomId)
    const navigate = useNavigate();

    const { state: room, api: { refetch } } = useFetchRoom(String(roomId));
    // const { state: setAllState, api: { setAll } } = useSetAll();

    if (room.error) {
        return (<>
            <p>Error loading data</p>
            <pre>{room.error}</pre>
        </>)
    }

    const navToDevice = (data: Device) => {
        navigate(`/${roomId}/devices/${data.id}`);
    }

    return (
        <div className="p-10 flex flex-col h-full w-full gap-2 bg-slate-900">
            <Banner title={room.data?.name || "unnamed room"} loading={room.loading}>
                <button
                    onClick={() => navigate("/")}
                    className="bg-slate-800 text-slate-100 p-3 rounded-md">
                    Back
                </button>
                <button
                    onClick={() => navigate(`/${roomId}/config`)}
                    disabled={roomId === 0}
                    style={{ opacity: roomId === 0 ? 0.2 : 1 }}
                    className="bg-slate-800 text-slate-100 p-3 rounded-md h-12">
                    <span className="text-4xl leading-none relative" style={{
                        lineHeight: 0,
                        top: "6px"
                    } as CSSProperties}>
                        &#9881;
                    </span>
                </button>
            </Banner>
            <div className="flex flex-col gap-2 items-stretch overflow-y-auto">
                {!room.loading && room.data?.devices?.length === 0 ? <div>No devices found</div> :
                    room.data?.devices?.map((item: Device) => (
                        <LedCard
                            key={item.id}
                            device={item}
                            loading={room.loading}
                            selectDevice={() => navToDevice(item)}
                            refetch={refetch}
                        />
                    ))}
            </div>
        </div>
    );

}
