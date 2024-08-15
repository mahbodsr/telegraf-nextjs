import Button from "@/app/_components/Button";
import Input from "@/app/_components/Input";
import { useToast } from "@/contexts/Toast";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

interface IFieldValues {
  otp: string[];
}

interface IProps {
  username: string;
}

const VerifyOTP = ({ username }: IProps) => {
  const [isLoading, setLoading] = useState(false);
  const [, setToast] = useToast();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
    setFocus,
  } = useForm<IFieldValues>({
    defaultValues: { otp: [] },
    mode: "all",
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setFocus("otp.0");
  }, [setFocus]);

  const handleOtp: SubmitHandler<IFieldValues> = async ({ otp }) => {
    setLoading(true);

    const res = await fetch("/api/verifyOTP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otp.join(""), username }),
    });

    setLoading(false);
    if (res.ok) router.push("/");
    else {
      const json = await res.json();
      if (json.error)
        setToast([
          {
            message: json.error,
            type: "error",
            close: () => setToast([]),
          },
        ]);
    }

    if (res.ok) router.push("/");
    else setLoading(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const currentTarget = event.currentTarget;
    const previousSibling =
      currentTarget.previousSibling as HTMLInputElement | null;
    const nextSibling = currentTarget.nextSibling as HTMLInputElement | null;

    if (Number.isNaN(Number(event.key))) {
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowLeft" && previousSibling) {
      event.preventDefault();
      previousSibling.select();
    } else if (event.key === "ArrowRight" && nextSibling) {
      event.preventDefault();
      nextSibling.select();
    } else if (
      event.key === "Backspace" &&
      previousSibling &&
      currentTarget.value === ""
    ) {
      event.preventDefault();
      previousSibling.select();
    }
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const currentTarget = event.currentTarget;
    const value = currentTarget.value;

    if (Number.isNaN(Number(value))) {
      event.preventDefault();
      return;
    }
    const nextSibling = currentTarget.nextSibling as HTMLInputElement | null;
    const previousSibling =
      currentTarget.previousSibling as HTMLInputElement | null;
    setValue(event.currentTarget.name as `otp.${number}`, value);

    if (value && nextSibling) {
      nextSibling.select();
    } else if (!value && previousSibling) {
      previousSibling.select();
    } else if (value && !nextSibling && btnRef.current) {
      btnRef.current.disabled = false;
      btnRef.current.focus();
    }
  };

  return (
    <form
      className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm [&>*:not(:last-child)]:mb-8"
      onSubmit={handleSubmit(handleOtp)}
    >
      <ChatBubbleBottomCenterTextIcon className="fill-primary w-12 h-12 mx-auto animate-bounce" />
      <h2 className="text-center font-bold text-2xl">Check Telegram</h2>
      <div className="flex justify-between space-x-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Controller
            key={index}
            name={`otp.${index}`}
            control={control}
            rules={{ maxLength: 1, required: true }}
            render={({ field }) => (
              <input
                {...field}
                onClick={(e) => e.currentTarget.select()}
                type="number"
                maxLength={1}
                className="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary no-arrows"
                onInput={handleChange}
                onKeyDown={handleKeyDown}
              />
            )}
          />
        ))}
      </div>
      <Button
        color="primary"
        type="submit"
        disabled={isLoading || !isValid}
        isLoading={isLoading}
        ref={btnRef}
      >
        Sign in
      </Button>
    </form>
  );
};

export default VerifyOTP;
