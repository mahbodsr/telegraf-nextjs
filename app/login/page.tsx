"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilmIcon } from "@heroicons/react/24/solid";
import Input from "@/app/_components/Input";
import Button from "../_components/Button";
import { SubmitHandler, useForm } from "react-hook-form";

interface IFieldValues {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [isLoading, setLoading] = useState(false);
  const { handleSubmit, register } = useForm<IFieldValues>();
  const router = useRouter();

  const onSubmit: SubmitHandler<IFieldValues> = async ({
    username,
    password,
  }) => {
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) router.push("/");
    else setLoading(false)
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <form
        className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm [&>*:not(:last-child)]:mb-8"
        onSubmit={handleSubmit(onSubmit)}
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
        <Input
          label="Password"
          type="password"
          {...register("password", { required: true })}
          outlined
        />
        <Button
          color="primary"
          type="submit"
          disabled={isLoading}
          {...{ isLoading }}
        >
          Sign in
        </Button>
      </form>
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
  );
};

export default LoginPage;
