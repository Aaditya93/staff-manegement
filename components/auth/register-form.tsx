"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryList } from "@/lib/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerTravelAgent } from "@/actions/auth/travel-agent-register";
import { useTransition, useState } from "react";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { useRouter } from "next/navigation";

const TravelAgentRegisterSchema = z.object({
  name: z.string().min(3, {
    message: "Name should be at least 3 characters long",
  }),
  company: z.string().min(3, {
    message: "Company name should be at least 3 characters long",
  }),

  address: z.string().min(3, {
    message: "Address should be at least 3 characters long",
  }),
  phoneNumber: z.string(),
  country: z.string().min(3, {
    message: "Country should be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password should be at least 8 characters long",
  }),
});

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = async (
    values: z.infer<typeof TravelAgentRegisterSchema>
  ) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const result = await registerTravelAgent(values);

        if (result.error) {
          setError(result.error);
          return;
        }
        router.push("/");

        setSuccess(result.success);
        router.push("/home");

        form.reset();
      } catch (error) {
        console.error(error);
        setError("Something went wrong!");
      }
    });
  };

  const form = useForm<z.infer<typeof TravelAgentRegisterSchema>>({
    resolver: zodResolver(TravelAgentRegisterSchema),
    defaultValues: {
      name: "",
      company: "",
      address: "",
      phoneNumber: "",
      country: "",
      email: "",
      password: "",
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 ">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        placeholder="John Doe"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="phoneNumer"
                        placeholder="+911234567890"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Company Information Section */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <FormField
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="company"
                        placeholder="MakeMyTrip"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} // Keep control prop
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryList.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="address"
                      type="text"
                      placeholder="132 My Street, Kingston, New York 12401"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Account Information Section */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="text"
                        placeholder="name@example.com"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="********"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormSuccess message={success} />
          <FormError message={error} />

          <Button className="w-full" variant="default" type="submit">
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-500">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-gray-700">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </Form>
    </div>
  );
};
