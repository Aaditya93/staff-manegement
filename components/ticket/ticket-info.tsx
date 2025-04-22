import { ITicket } from "@/db/models/ticket";

import CompanyInfoCard from "./company-card";
import PersonnelInfoCard from "./personal-info-card";
import EmailStatsCard from "./email-stats-card";

interface TicketInfoGridProps {
  ticket: ITicket;
}

const TicketInfoGrid = ({ ticket }: TicketInfoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CompanyInfoCard ticket={ticket} />
      <PersonnelInfoCard ticket={ticket} />
      <EmailStatsCard ticket={ticket} />
    </div>
  );
};

export default TicketInfoGrid;
