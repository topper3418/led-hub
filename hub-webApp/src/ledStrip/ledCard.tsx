import { host, port } from "../App";

// import { useState, useEffect } from "react";
import { ledCardInterface } from "../types";
import { MultiStateButton } from "../components/multiStateButton";
import '../App.css';
import { useLedStripHooks } from "./hooks";

export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const url = `http://${host}:${port}/` + ledStrip.name;
  const {
    state: { devices, loading, error },
    api: { refetch, update }
  } = useLedStripHooks(url);
  // const [ uiOnState, setUiOnState ] = useState('on')

  // const colorIndicator = `rgba(${devices?.color?.r}, ${devices?.color?.g}, ${devices?.color?.b}, ${devices?.brightness / 10})`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  let nameClass = "name" 
  if (!ledStrip.connected) nameClass += " disconnected"

  const selectState = (newState: string) => { 
    console.log('current state is', devices);
    
    console.log('setting state to', {...devices, on: newState == 'on'})
    update({...devices, on: newState == 'on'});
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
        clicked={devices.on ? 'on' : 'off'}
        setClicked={selectState}
        selectedColor={`rgb(${devices.color.r},${devices.color.g},${devices.color.b})`}
      />
    </div>
  );
};


