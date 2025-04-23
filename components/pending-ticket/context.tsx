"use client";

import React, { createContext, useContext, useState } from "react";

// Define types for selected staff info
interface StaffInfo {
  id: string;
  name: string;
  email: string;
}

interface TicketContextType {
  selectedReservationStaff: StaffInfo | null;
  selectedSalesStaff: StaffInfo | null;
  estimatedTime: string; // Add estimatedTime
  setSelectedReservationStaff: (staff: StaffInfo | null) => void;
  setSelectedSalesStaff: (staff: StaffInfo | null) => void;
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
  const [selectedReservationStaff, setSelectedReservationStaff] =
    useState<StaffInfo | null>(null);
  const [selectedSalesStaff, setSelectedSalesStaff] =
    useState<StaffInfo | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("1H"); // Default to 1H

  return (
    <TicketContext.Provider
      value={{
        selectedReservationStaff,
        selectedSalesStaff,
        estimatedTime,
        setSelectedReservationStaff,
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
