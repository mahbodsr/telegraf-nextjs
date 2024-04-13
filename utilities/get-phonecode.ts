import EventEmitter from "events";

export default function getPhoneCode(ev: EventEmitter) {
  console.log("you should now enter phonecode.");
  return new Promise<string>((resolve) =>
    ev.on("phonecode", (code: string) => resolve(code))
  );
}
