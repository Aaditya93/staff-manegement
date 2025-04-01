"use client";

import { KanbanExample } from "@/components/kanban/kanban";
import { SidebarDemo } from "@/components/sidebar/demo";

export const DashboardPage = () => {
  return (
    <div className="h-screen w-full ">
      <SidebarDemo>
        <KanbanExample />
      </SidebarDemo>
    </div>
  );
};

export default DashboardPage;
