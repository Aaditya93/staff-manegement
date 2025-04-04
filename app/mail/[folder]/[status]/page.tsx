import Image from "next/image";
import { Mail } from "@/components/mail/mail";
import { accounts } from "@/components/mail/data";

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

  const filterUnread = status === "unread";

  // Fetch emails with the filter parameter
  const mail = await fetchFolderEmails(folder, { filterUnread });

  // Convert the fetched emails to the desired format

  const transformedMails = await convertGraphEmailsToMailFormat(mail);

  return (
    <>
      <div className="md:hidden ">
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
      <div className="hidden flex-col md:flex h-screen">
        <Mail
          accounts={accounts}
          mails={transformedMails}
          defaultLayout={[20, 40, 40]} // Explicitly set default sizes
          defaultCollapsed={false}
          navCollapsedSize={4}
          currentFolder={folder}
          currentStatus={status}
        />
      </div>
    </>
  );
};

export default MailPage;

export const dynamic = "force-dynamic";
