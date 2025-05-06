"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  approveTravelAgent,
  regjectTravelAgent,
} from "@/actions/admin-panel/getTravelAgents";
import { toast } from "sonner";

interface UserApprovalCardsProps {
  data: {
    _id: string;
    name: string;
    email: string;
    company: string;
    address: string;
    phoneNumber: string;
    country: string;
    createdAt: string;
  }[];
}

export const UserApprovalCards = (
  UserApprovalCardsProps: UserApprovalCardsProps
) => {
  const { data } = UserApprovalCardsProps;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (id: string, email: string) => {
    try {
      const result = await approveTravelAgent(id, email);
      if (!result) return toast.error("No response from server");
      if (result.error) return toast.error(result.error);
      toast.success(result.success);
    } catch (error) {
      console.error(error);
      toast.error("Internal server error");
    }
  };

  const handleReject = async (id: string, email: string) => {
    try {
      const result = await regjectTravelAgent(id, email);
      if (result.error) return toast.error(result.error);
      toast.success(result.success);
    } catch (error) {
      console.error(error);
      toast.error("Internal server error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4  max-w-7xl mx-auto">
      {data.map((user) => (
        <Card key={user._id} className="w-full p-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Company</p>
              <p className="text-base font-medium">{user.company}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Country</p>
              <p className="text-base font-medium">{user.country}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-base font-medium">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="text-base font-medium">{user.phoneNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-base font-medium">{user.address}</p>
            </div>
            <div className="space-y-1"></div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              onClick={() => handleApprove(user._id, user.email)}
              className="flex-1 bg-green-500 "
            >
              Approve
            </Button>
            <Button
              onClick={() => handleReject(user._id, user.email)}
              variant="destructive"
              className="flex-1"
            >
              Reject
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default UserApprovalCards;
