"use client";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
export const LoginButton = () => {
  return (
    <div>
      <Button onClick={() => signIn("microsoft-entra-id")}>Login</Button>
    </div>
  );
};
