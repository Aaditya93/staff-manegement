"use client";

import React, { createContext, useContext, useState } from "react";

// Define types for selected staff info
interface StaffInfo {
  id: string;
  name: string;
  email: string;
}

interface TicketContextType {
  selectedSalesStaff: StaffInfo | null;
  selectedTravelAgent: StaffInfo | null; // Add travel agent
  estimatedTime: string; // Add estimatedTime

  setSelectedSalesStaff: (staff: StaffInfo | null) => void;
  setSelectedTravelAgent: (agent: StaffInfo | null) => void; // Add setter
  setEstimatedTime: (time: string) => void; // Add setter
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({
  children,
  ticketId,
}: {
  children: React.ReactNode;
  ticketId: string;
}) {
  // Initialize with null instead of empty string

  const [selectedSalesStaff, setSelectedSalesStaff] =
    useState<StaffInfo | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("1H"); // Default to 1H
  const [selectedTravelAgent, setSelectedTravelAgent] =
    useState<StaffInfo | null>(null); // Add state

  return (
    <TicketContext.Provider
      value={{
        selectedSalesStaff,
        estimatedTime,
        selectedTravelAgent,
        setSelectedTravelAgent, // Add setter
        setSelectedSalesStaff,
        setEstimatedTime,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTicketContext() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTicketContext must be used within a TicketProvider");
  }
  return context;
}
