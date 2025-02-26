import { MultiStateButton } from "../../components/multiStateButton";
import React, { useEffect, useState } from "react";
import { Room, LedStrip, Color } from "../../types";
import { intToHex, getLedColor } from "../../util";
import { useGetRoom, useWriteToRoom } from "./hooks";

interface RoomCardInterface {
  room: Room;
  selectDevice: () => void;
}

export const RoomCard: React.FC<RoomCardInterface> = (
  { room, selectDevice }
) => {
  const { state: fetchState, api: fetchApi } = useGetRoom(room.id);
  const { state: toggleState, setRoom } = useWriteToRoom(room.id);
  const [bufferState, setBufferState] = useState(false);

  // callback for the multi state button
  const selectState = (newState: string) => {
    setRoom({ data: { ...room, on: newState == 'on' } });
  }

  useEffect(() => {
    if (!fetchState.loading) {
      const ledStrips = fetchState.data?.led_strips;
      const allOn = ledStrips?.every((led_strip: LedStrip) => led_strip.on) || false;
      setBufferState(allOn);
    }
  }, [fetchState.loading])

  useEffect(() => {
    if (!toggleState.loading && toggleState.data) {
      setBufferState(toggleState.data?.data?.on || false);
    }
  }, [toggleState.loading])

  // color for the button
  return (
    <div className="flex flex-row border border-slate-100 bg-slate-850 rounded-md justify-between p-2.5" onClick={selectDevice}>
      <div className="flex flex-col justify-between gap-1">
        <p className="text-slate-100">{room.name}</p>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-slate-400 text-xs text-center">
            {'connection: '}
          </p>
        </div>
      </div>
      <MultiStateButton
        options={['off', 'on']}
        clicked={bufferState ? 'on' : 'off'}
        setClicked={selectState}
        selectedColor={"#FFFFFF"}
        loading={toggleState.loading}
      />
    </div>
  );
};


