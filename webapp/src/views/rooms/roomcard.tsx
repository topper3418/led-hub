import { MultiStateButton } from "../../components/multiStateButton";
import React, { useEffect, useState } from "react";
import { Room, LedStrip, Color, Device } from "../../types";
import { intToHex, getLedColor } from "../../util";
import { useGetRoom, useWriteToRoom } from "./hooks";

interface RoomCardInterface {
  room: Room;
  selectDevice: () => void;
}

export const RoomCard: React.FC<RoomCardInterface> = (
  { room, selectDevice }
) => {
  const { state: roomState, api: fetchApi } = useGetRoom(room.id);
  const { state: toggleState, setRoom } = useWriteToRoom(room.id);
  const [bufferState, setBufferState] = useState(false);
  const [numLedStrips, setNumLedStrips] = useState(0);

  // callback for the multi state button
  const selectState = (newState: string) => {
    setRoom({ data: { ...room, on: newState == 'on' } });
    setBufferState(newState == 'on');
  }

  useEffect(() => {
    if (!roomState.loading) {
      const devices = roomState.data?.devices || [];
      const allOn = devices.length > 0 ? devices?.every((device: Device) => device.led_strip?.on) || false : false;
      setBufferState(allOn);
      setNumLedStrips(devices?.length)
    }
  }, [roomState.loading])

  useEffect(() => {
    if (!toggleState.loading && toggleState.data) {
      setBufferState(toggleState.data?.data?.on || false);
    }
  }, [toggleState.loading])

  return (
    <RoomCardElement
      roomName={room.name || 'Unnamed Room'}
      numLedStrips={numLedStrips}
      bufferState={bufferState}
      loading={toggleState.loading}
      selectState={bufferState ? 'on' : 'off'}
      selectCallback={selectDevice}
      toggleCallback={selectState}
    />
  )
};


interface RoomCardElementInterface {
  roomName: string;
  numLedStrips: number;
  bufferState: boolean;
  loading: boolean;
  selectState: string;
  selectCallback: () => void;
  toggleCallback: (newState: string) => void;
}

export const RoomCardElement: React.FC<RoomCardElementInterface> = (
  { roomName, numLedStrips, bufferState, loading, selectCallback, toggleCallback }
) => {
  return (
    <div className="flex flex-row border border-slate-100 bg-slate-850 rounded-md justify-between p-2.5" onClick={selectCallback}>
      <div className="flex flex-col justify-between gap-1">
        <p className="text-slate-100">{roomName}</p>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-slate-400 text-xs text-center">
            {`lights: ${numLedStrips}`}
          </p>
        </div>
      </div>
      <MultiStateButton
        options={['off', 'on']}
        clicked={bufferState ? 'on' : 'off'}
        setClicked={toggleCallback}
        selectedColor={"#FFFFFF"}
        loading={loading}
      />
    </div>
  );
}


