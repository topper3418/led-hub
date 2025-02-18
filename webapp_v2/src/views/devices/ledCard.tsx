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

  let nameClass = "name"
  if (!device.connected) nameClass += " disconnected"

  const selectState = (newState: string) => {
    console.log('selectState', newState);
    api.post({ data: { ...device, on: newState == 'on' } });
    refetch();
  }

  return (
    <div className="deviceTile" onClick={selectDevice}>
      <div className={nameClass}>{device.name}</div>
      <MultiStateButton
        options={['off', 'on']}
        clicked={device.on ? 'on' : 'off'}
        setClicked={selectState}
        selectedColor={`rgb(${device.color.r},${device.color.g},${device.color.b})`}
        loading={toggleState.loading}
      />
    </div>
  );
};


