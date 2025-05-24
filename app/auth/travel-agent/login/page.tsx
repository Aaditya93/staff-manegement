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
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      <div className="relative h-[300px] lg:h-full">
        <Image
          src="/login.png"
          alt="login"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black/30">
          <div className="absolute top-0 left-0 w-full p-6 flex items-center z-10">
            <Link href="/home" className="flex items-center">
              <Image
                src="/logo.png"
                width={50}
                height={50}
                alt="Victoria Tours"
                className="mr-3 bg-white/90 rounded-lg p-1"
              />
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                Victoria Tours
              </h1>
            </Link>
          </div>
        </div>
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
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default LoginPage;
