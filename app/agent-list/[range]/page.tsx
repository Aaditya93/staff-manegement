import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import AppSidebar from "@/components/sidebar/app-sidebar";
import { getAllTravelAgents } from "@/actions/travel-agent-list/getAllTravelAgents";
import AgentCard from "@/components/travel-agent-list/agent-card";
import CommandMenu from "@/components/travel-agent-list/command-menu";
const VisaLetterPrices = async ({
  params,
}: {
  params: Promise<{ range: string }>;
}) => {
  const { range } = await params;
  const travelAgents = await getAllTravelAgents();
  const seralizedTravelAgents = travelAgents.map((agent) => ({
    _id: agent._id.toString(),
    name: agent.name,
    email: agent.email,
  }));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 ">
          <CommandMenu agents={seralizedTravelAgents} />
          <AgentCard agents={seralizedTravelAgents} range={range} />

          {/* <VisaPriceCard companies={planObj} range={range} /> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default VisaLetterPrices;
export const dynamic = "force-dynamic";
