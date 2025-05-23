"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateTravelAgentInfo } from "@/actions/travel-agent-list/getAllTravelAgents";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(5, { message: "Phone number is required." }),
  company: z.string().min(1, { message: "Company name is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  address: z.string().min(5, { message: "Address is required." }),
});

// Update the interface to include _id
interface TravelAgentFormProps {
  userId: string;
  travelAgent: {
    _id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    company?: string;
    country?: string;
    address?: string;
  } | null;
}

export default function TravelAgentForm({
  travelAgent,
  userId,
}: TravelAgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: travelAgent?.name || "",
      email: travelAgent?.email || "",
      phoneNumber: travelAgent?.phoneNumber || "",
      company: travelAgent?.company || "",
      country: travelAgent?.country || "",
      address: travelAgent?.address || "",
    },
  });

  // And fix the onSubmit function
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // If user ID is missing, call the version without userId parameter
      if (!travelAgent?._id) {
        // Call the version with just the form values
        const result = await updateTravelAgentInfo(userId, values);

        if (result.success) {
          toast.success("Travel agent information created successfully.");
        } else {
          toast.error(
            result.message || "Failed to create travel agent information"
          );
        }
      } else {
        // Call with userId and values
        const result = await updateTravelAgentInfo(userId, values);

        if (result.success) {
          toast.success("Travel agent information updated successfully.");
        } else {
          toast.error(
            result.message || "Failed to update travel agent information"
          );
        }
      }
    } catch (error) {
      console.error("Error updating travel agent:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Card className="w-4xl shadow-lg ">
      <CardHeader className="bg-primary rounded-t-md border-b">
        <CardTitle className="text-2xl font-bold text-primary-foreground ">
          Travel Agent Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+911234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Company Information Section */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="MakeMyTrip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80">
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="United States">
                              United States
                            </SelectItem>
                            <SelectItem value="United Kingdom">
                              United Kingdom
                            </SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Japan">Japan</SelectItem>
                            <SelectItem value="China">China</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="United Arab Emirates">
                              United Arab Emirates
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="132 My Street, Kingston, New York 12401"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Section */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="w-auto px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
