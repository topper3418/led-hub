// import { BACKEND_ROOT_URL } from "../../config";

// import { useState, useEffect } from "react";
import { MultiStateButton } from "../../components/multiStateButton";
import React from "react";
import { useToggleLedStrip } from "./hooks";

interface LedCardInterface {
  ledStrip: any;
  selectDevice: () => void;
  refetch: () => void;
}

export const LedCard: React.FC<LedCardInterface> = ({ ledStrip, selectDevice, refetch }) => {
  const { state: toggleState, api } = useToggleLedStrip(ledStrip.name);

  let nameClass = "name"
  if (!ledStrip.connected) nameClass += " disconnected"

  const selectState = (newState: string) => {
    console.log('selectState', newState);
    api.post({ data: { ...ledStrip, on: newState == 'on' } });
    refetch();
  }

  return (
    <div className="deviceTile" onClick={selectDevice}>
      <div className={nameClass}>{ledStrip.name}</div>
      <MultiStateButton
        options={['off', 'on']}
        clicked={ledStrip.on ? 'on' : 'off'}
        setClicked={selectState}
        selectedColor={`rgb(${ledStrip.color.r},${ledStrip.color.g},${ledStrip.color.b})`}
        loading={toggleState.loading}
      />
    </div>
  );
};


