import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ForgotPasswordCard from "@/components/auth/forgot-password-card";
import { Lock } from "lucide-react";
import Link from "next/link";

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center  p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Password Reset
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we&apos;ll send you instructions to
              reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ForgotPasswordCard />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="link" className="text-sm">
            <Link href="/auth/login"> Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
