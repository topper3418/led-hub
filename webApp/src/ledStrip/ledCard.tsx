import { host, port } from "../App";

import { useState, useEffect } from "react";
import { ledCardInterface } from "../types";
import { MultiStateButton } from "../components/multiStateButton";
import '../App.css';
import { useGetStrip, useSetStrip, useLedStripHooks } from "./hooks";

export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const url = `http://${host}:${port}/` + ledStrip.name;
  // const { 
  //   state, 
  //   loading, 
  //   error, 
  //   refetch 
  // } = useGetStrip(url);
  // const { 
  //   updateStrip, 
  //   data: setResponseData, 
  //   loading: setLoading,
  //   error: setError
  // } = useSetStrip(url)
  const {
    state: { data, loading, error },
    api: { refetch, update }
  } = useLedStripHooks(url);
  const [ uiOnState, setUiOnState ] = useState('on')

  // refresh the button state when there's response on the update
  // useEffect(() => {
  //   console.log('setReponse changed: ', setResponseData)
  //   refetch()
  // }, [setResponseData])

  const colorIndicator = `rgba(${data?.color?.r}, ${data?.color?.g}, ${data?.color?.b}, ${data?.brightness / 10})`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  let nameClass = "name" 
  if (!ledStrip.connected) nameClass += " disconnected"

  const selectState = (newState: str) => {
    console.log('current state is', data);
    
    console.log('setting state to', {...data, on: newState == 'on'})
    update({...data, on: newState == 'on'});
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


