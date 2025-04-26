import React from "react";
import { Lock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import PasswordResetForm from "@/components/auth/password-reset-form";
const PasswordResetPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 space-y-4">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">Create New Password</h2>
          <p className="text-sm text-muted-foreground">
            Please choose a strong password to protect your account
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PasswordResetForm />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            asChild
            variant="link"
            className="text-sm text-muted-foreground"
          >
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordResetPage;
