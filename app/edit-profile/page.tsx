import { auth } from "@/auth";
import { EditProfile } from "@/components/profile/edit-profile";
import { getUserById } from "@/db/models/User";
import AppSidebar from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
export default async function EditProfilePage() {
  const session = await auth();
  const user = await getUserById(session?.user.id);
  const UserObj = JSON.parse(JSON.stringify(user));
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex justify-center items-center px-4">
          <div className="w-full max-w-2xl">
            <EditProfile userData={UserObj} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export const dynamic = "force-dynamic";
