import { host, port } from "../App";

import { useState, useEffect } from "react";
import { ledCardInterface } from "../types";


export const LedCard = ({ ledStrip, selectDevice }: ledCardInterface) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [color, setColor] = useState({ r: 171, g: 37, b: 103 });
  const [on, setOn] = useState(false);
  const [brightness, setBrightness] = useState(255);

  const url = `http://${host}:${port}/` + ledStrip.name;

  useEffect(() => {
    console.log("loading data for device", ledStrip);
    setLoading(true);
    fetch(url)
      .then((res: Response) => {
        if (!res.ok) {
          throw new Error(
            "Request failed, status: " +
            res.status +
            " " +
            res.statusText
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("data returned from request", data);
        const [r, g, b] = data.color;
        setColor({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
        setOn(data.on);
        setBrightness(Math.round((data.brightness * 10) / 255)); // convert 0-255 to 0-10 and round to the nearest integer
      })
      .catch((err) => {
        setError(true);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const colorIndicator = `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness / 10})`;
  const indicatorClass = `indicator ${on ? "radiant-border" : ""}`;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  // Rest of the code...
  return (
    <div className="deviceTile" onClick={selectDevice}>
      <div className="name">{ledStrip.name}</div>
      <div
        className={indicatorClass}
        style={{ backgroundColor: colorIndicator }}
      ></div>
    </div>
  );
};


