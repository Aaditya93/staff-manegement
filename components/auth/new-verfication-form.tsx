"use client";
import { Suspense } from "react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import newVerification from "@/actions/auth/new-verification";
// Separate component for search params handling
const VerificationContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [statusText, setStatusText] = useState("Verifying your email");
  const [animationStyle, setAnimationStyle] = useState<
    "dots" | "spinner" | "pulse"
  >("dots");
  const [verificationState, setVerificationState] = useState("verifying");

  const onSubmit = React.useCallback(async () => {
    if (!token) {
      setVerificationState("error");
      setStatusText("Invalid verification token");
      return;
    }

    const verification = await newVerification(token);

    if (verification.success) {
      setVerificationState("success");
      setStatusText(verification.success);
    }
    if (verification.error) {
      setVerificationState("error");
      setStatusText(verification.error);
    }
  }, [token]);

  useEffect(() => {
    onSubmit();
    const messages = [
      "Verifying your email",
      "Setting up your account",
      "Almost ready...",
      "Just a moment",
    ];
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setStatusText(messages[currentIndex]);
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(textInterval);
    }, 2000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timeout);
    };
  }, [onSubmit]);

  useEffect(() => {
    const animations: Array<"dots" | "spinner" | "pulse"> = [
      "dots",
      "spinner",
      "pulse",
    ];
    let currentIndex = 0;

    const animationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % animations.length;
      setAnimationStyle(animations[currentIndex]);
    }, 3000);

    return () => clearInterval(animationInterval);
  }, []);

  const LoadingAnimations = {
    dots: (
      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]"
            style={{
              animationDelay: `${i * 100}ms`,
              opacity: i === 1 ? 0.5 : 1,
            }}
          />
        ))}
      </div>
    ),

    spinner: (
      <div className="flex justify-center mb-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),

    pulse: (
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-[ping_1.5s_ease-in-out_infinite]" />
          <div className="absolute inset-0 border-4 border-primary rounded-full" />
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Verify
            </span>
          </div>

          <div className="min-h-[2.5rem]">
            <h2
              className="text-center text-xl text-muted-foreground mb-8 transition-opacity duration-500"
              key={statusText}
            >
              {statusText}
            </h2>
          </div>

          {verificationState === "verifying" &&
            LoadingAnimations[animationStyle]}

          {verificationState === "success" && (
            <div className="flex justify-center mb-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-[bounce_1s_ease-in-out]" />
            </div>
          )}

          {verificationState === "error" && (
            <div className="flex justify-center mb-8">
              <XCircle className="w-16 h-16 text-destructive animate-[shake_0.5s_ease-in-out]" />
            </div>
          )}

          <Button asChild className="w-full">
            <Link href="/auth/travel-agent/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrapper component with Suspense
const VerificationForm = () => {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <VerificationContent />
    </Suspense>
  );
};

export default VerificationForm;
