"use client";
import { SignOut } from "@/actions/auth/sign-out";
import { Button } from "@/components/ui/button";

export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        This is the dashboard page. You can add your content here.
      </p>
      <Button onClick={() => SignOut()}>Log out</Button>
    </div>
  );
};
export default DashboardPage;
