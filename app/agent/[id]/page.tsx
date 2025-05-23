import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { getTravelAgentById } from "@/actions/travel-agent-list/getAllTravelAgents";
import TravelAgentForm from "@/components/travel-agent-list/agent-form";

const VisaLetterPricesEdit = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const travelAgent = await getTravelAgentById(id);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="container mx-auto h-full flex items-center justify-center py-8">
          <TravelAgentForm
            travelAgent={travelAgent.travelAgentId}
            userId={id}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default VisaLetterPricesEdit;
export const dynamic = "force-dynamic";
