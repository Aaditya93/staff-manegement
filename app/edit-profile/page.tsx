import { auth } from "@/auth";
import { EditProfile } from "@/components/profile/edit-profile";
import { getUserById } from "@/db/models/User";
import AppSidebar from "@/components/sidebar/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default async function EditProfilePage() {
  const session = await auth();
  const user = await getUserById(session?.user.id);
  const UserObj = JSON.parse(JSON.stringify(user));
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden justify-center items-center">
        <div className="w-full max-w-2xl">
          {" "}
          {/* Removed centering classes here */}
          <EditProfile userData={UserObj} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export const dynamic = "force-dynamic";
