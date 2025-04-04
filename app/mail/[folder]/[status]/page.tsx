import Image from "next/image";
import { Mail } from "@/components/mail/mail";
import { accounts } from "@/components/mail/data";
import { SidebarDemo } from "@/components/sidebar/demo";
import { fetchFolderEmails } from "@/actions/mail/mail";
import { convertGraphEmailsToMailFormat } from "@/actions/mail/transfrom-mail";

interface MailPageProps {
  params: {
    folder: "inbox" | "drafts" | "sent" | "junk" | "trash" | "archive";
    status: string;
  };
}

export const MailPage = async ({ params }: MailPageProps) => {
  const { folder, status } = await params;

  const mail = await fetchFolderEmails(folder, {
    filterUnread: status === "unread" ? true : false,
  });

  const transformedMails = await convertGraphEmailsToMailFormat(mail);

  return (
    <>
      <SidebarDemo>
        <div className="md:hidden">
          <Image
            src="/examples/mail-dark.png"
            width={1280}
            height={727}
            alt="Mail"
            className="hidden dark:block"
          />
          <Image
            src="/examples/mail-light.png"
            width={1280}
            height={727}
            alt="Mail"
            className="block dark:hidden"
          />
        </div>
        <div className="hidden flex-col md:flex">
          <Mail
            accounts={accounts}
            mails={transformedMails}
            defaultLayout={[20, 40, 40]} // Explicitly set default sizes
            defaultCollapsed={false}
            navCollapsedSize={4}
            // currentFolder={folder}
            // currentStatus={status}
          />
        </div>
      </SidebarDemo>
    </>
  );
};

export default MailPage;
// In your app/layout.tsx or the specific page
export const dynamic = "force-dynamic";
