"use client";
import { EditProfile } from "@/components/profile/edit";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <EditProfile />
      <Button onClick={() => signOut()}>Log out</Button>
    </div>
  );
}
