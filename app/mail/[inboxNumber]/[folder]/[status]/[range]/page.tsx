import { Mail } from "@/components/mail/mail";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { fetchFolderEmails } from "@/actions/mail/fetch-emails";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
interface MailPageProps {
  params: {
    inboxNumber: number;
    folder: "inbox" | "drafts" | "sent" | "junk" | "trash" | "archive";
    status: string;
    range: string;
  };
}

const DashboardPage = async ({ params }: MailPageProps) => {
  const { inboxNumber, folder, status, range } = await params;

  const filterUnread = status === "unread";
  const mail = await fetchFolderEmails(folder, inboxNumber, {
    filterUnread,
    range,
  });
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="hidden md:flex h-full w-full border-b">
            <Mail
              inboxNumber={inboxNumber}
              mails={mail.emails}
              defaultLayout={[20, 40, 40]}
              defaultCollapsed={false}
              navCollapsedSize={4}
              currentFolder={folder}
              currentStatus={status}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardPage;
export const dynamic = "force-dynamic";
