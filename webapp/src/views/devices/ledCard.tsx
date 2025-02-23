// import { BACKEND_ROOT_URL } from "../../config";

// import { useState, useEffect } from "react";
import { MultiStateButton } from "../../components/multiStateButton";
import React from "react";
import { useToggleLedStrip } from "./hooks";
import { Device } from "../../types";
import { intToHex } from "../../util";

interface LedCardInterface {
  device: Device;
  selectDevice: () => void;
  refetch: () => void;
}

enum ConnectedStateEnum {
  HEALTHY = "HEALTHY",
  WEAK = "WEAK",
  DEAD = "DEAD",
}

export const LedCard: React.FC<LedCardInterface> = ({ device, selectDevice, refetch }) => {
  const { state: toggleState, api } = useToggleLedStrip(device.id);

  const selectState = (newState: string) => {
    console.log('selectState', newState);
    api.put({ data: { ...device, on: newState == 'on' } });
    refetch();
  }

  const { red, green, blue } = device?.led_strip?.color || { red: 255, green: 255, blue: 255 };

  const color = '#' + intToHex(red) + intToHex(green) + intToHex(blue);
  const lastPing = new Date(device.last_ping + "+00:00")
  const now = Date.now()
  const pingDwell = (now - lastPing.getTime()) / 1000
  const connectionState = pingDwell < 2 ? ConnectedStateEnum.HEALTHY : pingDwell < 5 ? ConnectedStateEnum.WEAK : ConnectedStateEnum.DEAD

  return (
    <div className="flex flex-row border border-slate-100 bg-slate-850 rounded-md justify-between p-2.5" onClick={selectDevice}>
      <div className="flex flex-col justify-between gap-1">
        <p className="text-slate-100">{device.name || device.mac}</p>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-slate-400 text-xs text-center">
            {'connection: '}
          </p>
          <span style={{
            color: connectionState === ConnectedStateEnum.HEALTHY ? 'green' :
              connectionState === ConnectedStateEnum.WEAK ? 'yellow' :
                'red',
            fontSize: '0.75rem',
            width: '0.75rem',
          }}>
            {'\u25cf'}
          </span>
        </div>
      </div>
      <MultiStateButton
        options={['off', 'on']}
        clicked={device?.led_strip?.on ? 'on' : 'off'}
        setClicked={selectState}
        selectedColor={color}
        loading={toggleState.loading}
      />
    </div>
  );
};


