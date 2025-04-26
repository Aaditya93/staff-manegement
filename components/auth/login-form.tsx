"use client";

import React, { Suspense } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/app/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { LoginButton } from "./login-button";
import { Input } from "@/components/ui/input";
import { login } from "@/actions/auth/login";
import { useTransition, useState } from "react";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Separate component for login form content
const LoginFormContent = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "This email is already registered with a different Provider"
      : "";

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    type="text"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <a
                    href="/auth/travel-agent/reset"
                    className="text-sm hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="********"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSuccess message={success} />
          <FormError message={error || urlError} />
          <LoginButton />
        </form>
      </Form>

      <div className="text-center text-sm">
        <span>Don&apos;t have an account?</span>{" "}
        <Link
          href="/auth/travel-agent/register"
          className="text-primary underline hover:text-primary/80"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

// Wrapper component with Suspense
export const LoginForm = () => {
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginFormContent />
    </Suspense>
  );
};
