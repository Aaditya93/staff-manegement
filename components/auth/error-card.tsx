import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Lock } from "lucide-react";
export const ErrorCard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center gap-2 items-center">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold ">
            Oops! Something went wrong!
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <p className=" mb-4">
            We encountered an error while processing your authentication
            request. Please try again or contact support if the problem
            persists.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild className="w-full max-w-xs">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
