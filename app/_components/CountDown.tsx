import { useEffect, useState } from "react";

const CountDown = ({ expiresAt }: { expiresAt: number }) => {
  const [, reRender] = useState({});
  useEffect(() => {
    setInterval(() => reRender({}), 1000);
  }, []);
  const remainingTimestamp = new Date(expiresAt - Date.now()).getTime();
  let seconds = Math.floor((remainingTimestamp / 1000) % 60)
    .toString()
    .padStart(2, "0");
  let minutes = Math.floor((remainingTimestamp / 1000 / 60) % 60)
    .toString()
    .padStart(2, "0");
  let hours = Math.floor((remainingTimestamp / 1000 / 60 / 60) % 24)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export default CountDown;
