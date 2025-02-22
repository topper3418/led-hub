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

export const LedCard: React.FC<LedCardInterface> = ({ device, selectDevice, refetch }) => {
  const { state: toggleState, api } = useToggleLedStrip(device.name);
  console.log("rendering ledCard", device);

  const selectState = (newState: string) => {
    console.log('selectState', newState);
    api.post({ data: { ...device, on: newState == 'on' } });
    refetch();
  }

  const { red, green, blue } = device?.led_strip?.color || { red: 255, green: 255, blue: 255 };

  const color = '#' + intToHex(red) + intToHex(green) + intToHex(blue);

  return (
    <div className="flex flex-row border border-slate-100 bg-slate-850 rounded-md justify-between p-2.5" onClick={selectDevice}>
      <p className="text-slate-100">{device.name || device.mac}</p>
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


