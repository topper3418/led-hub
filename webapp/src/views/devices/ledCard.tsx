// import { BACKEND_ROOT_URL } from "../../config";

// import { useState, useEffect } from "react";
import { MultiStateButton } from "../../components/multiStateButton";
import React from "react";
import { useToggleLedStrip } from "./hooks";
import { Device } from "../../types";

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

  const color = `rgb(${device?.led_strip?.color?.r},${device?.led_strip?.color?.g},${device?.led_strip?.color?.b})`;

  return (
    <div className="flex flex-row border justify-between p-1" onClick={selectDevice}>
      <p>{device.name || device.mac}</p>
      <MultiStateButton
        options={['off', 'on']}
        clicked={device?.led_strip?.on ? 'on' : 'off'}
        setClicked={selectState}
        currentColor={color}
        loading={toggleState.loading}
      />
    </div>
  );
};


