import { host, port } from "../App";

import { useState, useEffect } from "react";
import { ledCardInterface } from "../types";
import '../App.css';
import { useStripData } from "./hooks";

export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const url = `http://${host}:${port}/` + ledStrip.name;
  const { state, loading, error, refetch } = useStripData(url);
  console.log('state', state);

  const { color, on, brightness } = state | {};

  const colorIndicator = color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness / 10})` :
    'rgba(0,0,0,0';
  const indicatorClass = `indicator ${on ? "radiant-border" : ""}`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  const toggleLed = async () => {
    const payload = {
      on: !on,
      color: [color.r, color.g, color.b],
      brightness: Math.round((brightness * 255) / 10),
    };
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
      setOn(responseBody.on);
    } catch (err) {
      setError(true);
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
      ></div>
    </div>
  );
};


