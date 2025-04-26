import React from "react";
import { Button } from "@/components/ui/button";
import { CiLogin } from "react-icons/ci";
import Link from "next/link";

const RedirectLogin = () => {
  return (
    <div className="absolute top-4 right-4">
      <Button asChild variant="ghost" className="text-base">
        <Link href="/auth/travel-agent/login">
          {" "}
          <CiLogin />
          Sign in
        </Link>
      </Button>
    </div>
  );
};

export default RedirectLogin;
