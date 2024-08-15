"use client";

import { useEffect } from "react";
import cn from "classnames";
import ToastPortal from "./components/ToastPortal";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export interface Props {
  message: string;
  type?: keyof typeof Theme;
  close: () => void;
}

const ICONS = {
  error: XCircleIcon,
  success: CheckCircleIcon,
};

const Theme = {
  error: "bg-red-50 text-red-800 [&>svg]:text-red-400",
  success: "bg-green-50 text-green-800 [&>svg]:text-green-400",
};

const Toast = ({ message, type = "error", close }: Props) => {
  const Icon = ICONS[type];
  useEffect(() => {
    const timeOutId = setTimeout(close, 8000);
    return () => clearTimeout(timeOutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ToastPortal>
      <div
        className={cn(
          "p-1.5 px-4 flex items-center transition-opacity duration-225 ease-in-out transform duration-150",
          Theme[type],
          "whitespace-nowrap rounded-lg text-sm max-w-4xl mx-6 w-full mb-1.5"
        )}
      >
        <Icon className="mr-3 h-6 w-6" />
        <span>{message}</span>
        <span
          onClick={close}
          className={cn(
            "p-2 flex transition-colors duration-200 ease-out rounded-full cursor-pointer hover:bg-black/20 ml-auto"
          )}
        >
          <XMarkIcon className="h-6 w-6" />
        </span>
      </div>
    </ToastPortal>
  );
};

export default Toast;
