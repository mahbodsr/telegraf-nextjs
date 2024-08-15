import Button from "@/app/_components/Button";
import Input from "@/app/_components/Input";
import { useToast } from "@/contexts/Toast";
import { ArrowLongRightIcon, FilmIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface IFieldValues {
  username: string;
}

interface IProps {
  setUsername: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const SendOTP = ({ setUsername }: IProps) => {
  const [isLoading, setLoading] = useState(false);
  const { handleSubmit, register, setFocus } = useForm<IFieldValues>();
  const [, setToast] = useToast();

  const handleUsername: SubmitHandler<IFieldValues> = async ({ username }) => {
    setLoading(true);

    const res = await fetch("/api/sendOTP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    setLoading(false);
    if (res.ok) setUsername(username);
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
  };

  useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  return (
    <form
      className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm [&>*:not(:last-child)]:mb-8"
      onSubmit={handleSubmit(handleUsername)}
    >
      <FilmIcon className="fill-primary w-12 h-12 mx-auto" />
      <h2 className="text-center font-bold text-2xl">
        Sign in to your account
      </h2>
      <Input
        label="Username"
        {...register("username", { required: true })}
        outlined
      />
      <Button
        color="primary"
        type="submit"
        disabled={isLoading}
        {...{ isLoading }}
        icon={{ Component: ArrowLongRightIcon, type: "lead" }}
      >
        Next
      </Button>
    </form>
  );
};

export default SendOTP;
