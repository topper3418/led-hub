import { BACKEND_ROOT_URL } from "../config";

// import { useState, useEffect } from "react";
import { ledCardInterface } from "../types";
import { MultiStateButton } from "../components/multiStateButton";
import '../App.css';
import { useLedStripHooks } from "./hooks";

export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const url = BACKEND_ROOT_URL + ledStrip.name;
  const {
    state: { data, loading, error },
    api: { refetch, update }
  } = useLedStripHooks(url);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  let nameClass = "name"
  if (!ledStrip.connected) nameClass += " disconnected"

  const selectState = (newState: string) => {
    update({ ...data, on: newState == 'on' });
    refetch();
  }


  // TODO: 
  // make the indicator show one way when clicked
  // and then show fully once the server confirms the change


  return (
    <div className="deviceTile" onClick={selectDevice}>
      <div className={nameClass}>{ledStrip.name}</div>
      <MultiStateButton
        options={['off', 'on']}
        clicked={data.on ? 'on' : 'off'}
        setClicked={selectState}
        selectedColor={`rgb(${data.color.r},${data.color.g},${data.color.b})`}
      />
    </div>
  );
};


