"use client";

import { useState } from "react";
import VerifyOTP from "./_components/VerifyOTP";
import SendOTP from "./_components/SendOTP";
import { ToastConsumer, ToastProvider } from "@/contexts/Toast";
import Toast from "../_components/Toast";

interface IVerifyOTPFieldValues {
  otp: string;
}

const LoginPage = () => {
  const [username, setUsername] = useState<string | undefined>();

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        {username ? (
          <VerifyOTP username={username} />
        ) : (
          <SendOTP setUsername={setUsername} />
        )}
        <p className="mt-10 text-center text-sm text-gray-500">
          Any troubles?{" "}
          <a
            href="https://t.me/mahbodsr"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Contact Mahbod Saraei
          </a>
        </p>
      </div>
      <div
        id="toast"
        className="left-0 right-0 bottom-6 px-6 fixed flex flex-col items-center z-50"
      >
        <ToastConsumer>
          {([toasts]) => toasts.map((s, i) => <Toast {...s} key={i} />)}
        </ToastConsumer>
      </div>
    </ToastProvider>
  );
};

export default LoginPage;
