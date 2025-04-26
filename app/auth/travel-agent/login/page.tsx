import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

const LoginPage = () => {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      <div className="relative h-[300px] lg:h-full">
        <Image
          src="/login.png"
          alt="login"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 " />
      </div>
      <div className="flex items-center justify-center p-4 lg:py-12 lg:px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 p-4 lg:p-6">
            <CardTitle className="text-xl lg:text-2xl font-bold">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default LoginPage;
