import { host, port } from "../App";

import { useState, useEffect } from "react";
import { ledCardInterface } from "../types";
import '../App.css';
import { useStripData } from "./hooks";

export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const url = `http://${host}:${port}/` + ledStrip.name;
  const { state, loading, error, refetch } = useStripData(url);

  const colorIndicator = `rgba(${state?.color?.r}, ${state?.color?.g}, ${state?.color?.b}, ${state?.brightness / 10})`;
  // TODO may just go with ON/OFF, can remove comment below when thats accomplished. 
  const indicatorClass = `indicator` // ${state?.on ? "radiant-border" : ""}`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const toggleLed = async (event) => {
    const payload = {
      on: !state?.on,
      color: [state?.color?.r, state?.color?.g, state?.color?.b],
      brightness: Math.round((state?.brightness * 255) / 10),
    };
    event.stopPropagation();
    try {
      const response: Response = await fetch(`http://${host}:${port}/${ledStrip.name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(
          "Request failed, status: " +
          response.status +
          " " +
          response.statusText
        );
      }
      const responseBody = await response.json();

      console.log("data returned from request", responseBody);
      refetch();
    } catch (err) {
      console.error(err);
    }
  }

  // Rest of the code...
  return (
    <div className="deviceTile" onClick={selectDevice}>
      <div className="name">{ledStrip.name}</div>
      <div
        className={indicatorClass}
        style={{ backgroundColor: colorIndicator }}
        onClick={toggleLed}
      >
          {state?.on ? "ON" : "OFF"}
      </div>
    </div>
  );
};


