import { getReviewedTickets } from "@/actions/review/get-review";

import ReviewDashboard from "@/components/review/review-dashboard";

import AppSidebar from "@/components/sidebar/app-sidebar";
import { getUser } from "@/actions/review/get-review";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const ReviewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const reviews = await getReviewedTickets(id);

  const user = await getUser(id);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <ReviewDashboard user={user} reviews={reviews} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
export default ReviewPage;
export const dynamic = "force-dynamic";
