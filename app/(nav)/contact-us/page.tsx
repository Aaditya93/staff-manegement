import CallbackForm from "@/components/contact-us/contact-form";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export const ContactPage = () => {
  const t = useTranslations("contactUs");
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-16 px-4">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-border/50 shadow-xl">
            <CallbackForm />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
