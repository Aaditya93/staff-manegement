"use client";
import React, { Suspense } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { PasswordResetSchema } from "@/app/schemas";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { newPassword } from "@/actions/auth/new-password";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSuccess } from "@/components/auth/form-success";
import { FormError } from "@/components/auth/form-error";

// Separate component for the actual form content
const PasswordResetContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof PasswordResetSchema>>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof PasswordResetSchema>) => {
    try {
      setError("");
      setSuccess("");
      const response = await newPassword(values, token);
      if (response.success) {
        setSuccess(response.success);
        form.reset();
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {success && <FormSuccess message={success} />}
        {error && <FormError message={error} />}
        <div className="text-sm text-muted-foreground">
          Password must: Be at least 8 characters long
        </div>
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
    </Form>
  );
};

// Wrapper component with Suspense
const PasswordResetForm = () => {
  return (
    <Suspense fallback={<div>Loading password reset...</div>}>
      <PasswordResetContent />
    </Suspense>
  );
};

export default PasswordResetForm;
