"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  useEffect(() => {
    const reload = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") router.refresh();
    };
    window.addEventListener("keydown", reload);
    return () => window.removeEventListener("keydown", reload);
  }, [router]);
  return children;
}
