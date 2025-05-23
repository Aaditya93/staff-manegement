"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { MdOutlineMail } from "react-icons/md";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PiArrowCircleRightThin } from "react-icons/pi";
import { CiUser } from "react-icons/ci";

import { Loader2, Trash2 } from "lucide-react";
import { deleteAgent } from "@/actions/travel-agent-list/getAllTravelAgents";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import Link from "next/link";

import { useEffect, useState } from "react";
import PaginationComponent from "./pangination";

interface Agent {
  _id: string;

  name: string;
  email: string;
}

interface AgentCardProps {
  agents: Agent[];
  range: string;
}

// Delete Control Component
function DeleteAgentControl({
  agentId,
  onDeleteSuccess,
}: {
  agentId: string;
  onDeleteSuccess: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteAgent(agentId);

      if (result.success) {
        toast.success("Agent deleted successfully");
        onDeleteSuccess();
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to delete agent");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the agent");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this agent? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <div className="text-primary-foreground">Delete</div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const AgentCard = (props: AgentCardProps) => {
  const range = props.range;
  const NumRange = parseInt(range, 10);
  const [agentsList, setAgentsList] = useState<Agent[]>(props.agents);
  const totalPages = Math.ceil(agentsList.length / 10);
  const currentPage = NumRange / 10;
  const itemsPerPage = 10; // Items per page

  const [calltoast, setCallToast] = React.useState(false);

  useEffect(() => {
    if (calltoast) {
      toast.success("Agent has been updated", {});
      setCallToast(false);
    }
  }, [calltoast]);

  useEffect(() => {
    setAgentsList(props.agents);
  }, [props.agents]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleDeleteSuccess = (agentId: string) => {
    setAgentsList((prevAgents) =>
      prevAgents.filter((agent) => agent._id !== agentId)
    );
  };

  return (
    <Card className="w-full max-w-6xl sm:max-w-full mx-auto shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="p-4 sm:p-3 bg-primary rounded-t-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <CardTitle className="text-xl font-bold text-center sm:text-left text-primary-foreground">
            Travel Agents
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={"secondary"} className="text-primary">
              Total Agents: {agentsList.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="">
          {agentsList.slice(NumRange - 10, NumRange).map((agent: Agent) => (
            <div
              key={agent._id}
              className="border-b p-4 hover:bg-primary-foreground transition-colors duration-200 relative"
            >
              {/* Delete button positioned in absolute top right */}
              <div className="absolute top-2 right-2 z-10">
                <DeleteAgentControl
                  agentId={agent._id}
                  onDeleteSuccess={() => handleDeleteSuccess(agent._id)}
                />
              </div>

              {/* View details button positioned centrally on right side */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="hover:bg-primary-foreground"
                  asChild
                >
                  <Link href={`/agent/${agent._id}`}>
                    <PiArrowCircleRightThin className="w-5 h-5 sm:w-4 sm:h-4" />{" "}
                    View Details
                  </Link>
                </Button>
              </div>

              {/* Content area with proper spacing to accommodate the buttons */}
              <div className="space-y-3 pr-24">
                <div className="flex items-start flex-wrap gap-2">
                  <Badge variant="outline">ID: {agent._id}</Badge>
                  {!agent.name && (
                    <Badge variant="destructive">Missing Name</Badge>
                  )}
                </div>

                <Link href={`/agent-list/${agent._id}`}>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <CiUser className="w-5 h-5 flex-shrink-0 " />
                      <div>
                        <p className="text-xs ">Agent Name</p>
                        <p className="text-sm ">
                          {agent.name || "Not Provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MdOutlineMail className="w-5 h-5 flex-shrink-0 " />
                      <div>
                        <p className="text-xs ">Email</p>
                        <p className="text-sm ">{agent.email}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-background p-4 sm:p-3 flex justify-between items-center">
        <p className="text-sm">Last Updated: {formatDateTime(new Date())}</p>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
        />
      </CardFooter>
    </Card>
  );
};

export default AgentCard;
