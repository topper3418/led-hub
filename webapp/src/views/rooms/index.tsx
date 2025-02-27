import React, { CSSProperties, useEffect, useState } from "react";
import Banner from "../../components/banner";
import { useNavigate } from "react-router-dom";
import { useAddRoom, useRoomHooks, useWriteToRoom } from "./hooks";
import { Device, LedStrip, Room } from "../../types";
import { RoomCard, RoomCardElement } from "./roomCard";


const Rooms: React.FC = () => {
    const navigate = useNavigate();
    const { rooms, miscRoom, api: fetchApi } = useRoomHooks();
    const { state: addState, addGenericRoom } = useAddRoom();
    const { state: writeMiscState, setRoom: setMiscRoom } = useWriteToRoom(0);
    const [bufferState, setBufferState] = useState(false);
    const [numMiscLedStrips, setNumMiscLedStrips] = useState(0);
    const navToRoom = (room: Room) => {
        navigate('/' + room.id)
    }
    const toggleMiscRoom = (newState: string) => {
        console.log('toggling misc room', newState)
        setBufferState(newState == 'on');
        setMiscRoom({ data: { ...miscRoom.data, on: newState == 'on' } });
    }
    useEffect(() => {
        if (!miscRoom.loading) {
            const devces = miscRoom.data?.devices || [];
            console.log('got misc room data:', miscRoom.data)
            const allOn = devces?.every((device: Device) => device?.led_strip?.on) || false;
            console.log('setting buffer state to', allOn)
            setBufferState(allOn);
            setNumMiscLedStrips(devces?.length)
        }
    }, [miscRoom.loading])

    return (
        <div className="p-10 flex flex-col h-full w-full gap-2 bg-slate-900">
            <Banner title="LED Hub">
                <></>
                <button
                    onClick={addGenericRoom}
                    className="bg-slate-800 text-slate-100 p-3 rounded-md h-12">
                    <span className="text-4xl leading-none relative" style={{
                        lineHeight: 0,
                        top: "6px"
                    } as CSSProperties}>
                        +
                    </span>
                </button>
            </Banner>
            <div className="flex flex-col gap-2 items-stretch overflow-y-auto">
                {rooms.data?.length === 0 ? <div>No rooms found</div> :
                    rooms.data?.map((item: Room) => (
                        <RoomCard
                            key={item.id}
                            room={item}
                            selectDevice={() => navToRoom(item)}
                        />
                    ))}
                {miscRoom.data && numMiscLedStrips > 0 && <RoomCardElement
                    roomName="Misc"
                    numLedStrips={numMiscLedStrips}
                    bufferState={bufferState}
                    loading={miscRoom.loading}
                    selectState={bufferState ? 'on' : 'off'}
                    selectCallback={() => navToRoom({ id: 0 } as Room)}
                    toggleCallback={toggleMiscRoom} />}
            </div>
        </div>
    )
}

export default Rooms;
