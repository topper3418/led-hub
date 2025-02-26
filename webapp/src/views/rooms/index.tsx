import React, { CSSProperties } from "react";
import Banner from "../../components/banner";
import { useNavigate } from "react-router-dom";
import { useAddRoom, useRoomHooks } from "./hooks";
import { Room } from "../../types";
import { RoomCard } from "./roomCard";


const Rooms: React.FC = () => {
    const navigate = useNavigate();
    const { rooms, miscRoom, api: fetchApi } = useRoomHooks();
    const { state: addState, addGenericRoom } = useAddRoom();
    const navToRoom = (room: Room) => {
        navigate('/' + room.id)
    }
    const numMiscLedStrips = miscRoom.data?.led_strips?.length || 0;
    return (
        <div className="p-10 flex flex-col h-full w-full gap-2 bg-slate-900">
            <Banner title="Rooms">
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
                {!rooms.loading && rooms.data?.length === 0 ? <div>No rooms found</div> :
                    rooms.data?.map((item: Room) => (
                        <RoomCard
                            key={item.id}
                            room={item}
                            selectDevice={() => navToRoom(item)}
                        />
                    ))}
                {miscRoom.data && numMiscLedStrips > 0 && <RoomCard
                    key={0}
                    room={miscRoom.data}
                    selectDevice={() => navToRoom(miscRoom.data as Room)}
                />}
            </div>
        </div>
    )
}

export default Rooms;
