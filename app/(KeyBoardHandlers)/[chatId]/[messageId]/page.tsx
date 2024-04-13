"use client";

import { useEffect, useRef } from "react";

const Component = ({
  params,
}: {
  params: { chatId: string; messageId: string };
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const FullScreenHandler = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") videoRef.current?.requestFullscreen();
    };
    window.addEventListener("keydown", FullScreenHandler);
    return () => window.removeEventListener("keydown", FullScreenHandler);
  }, [videoRef]);
  return (
    <video autoPlay controls ref={videoRef}>
      <source
        src={`/stream/${params.chatId}/${params.messageId}`}
        type="video/mp4"
      />
    </video>
  );
};

export default Component;
