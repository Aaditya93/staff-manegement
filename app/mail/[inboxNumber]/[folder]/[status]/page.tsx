import Image from "next/image";
import { Mail } from "@/components/mail/mail";
import { fetchFolderEmails } from "@/actions/mail/mail";
import { convertGraphEmailsToMailFormat } from "@/actions/mail/transfrom-mail";
interface MailPageProps {
  params: {
    inboxNumber: number;
    folder: "inbox" | "drafts" | "sent" | "junk" | "trash" | "archive";
    status: string;
  };
}

export const MailPage = async ({ params }: MailPageProps) => {
  const { inboxNumber, folder, status } = await params;

  const filterUnread = status === "unread";

  const mail = await fetchFolderEmails(folder, inboxNumber, { filterUnread });

  console.log("Fetched emails:", mail);
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
          inboxNumber={inboxNumber}
          mails={mail.emails}
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
