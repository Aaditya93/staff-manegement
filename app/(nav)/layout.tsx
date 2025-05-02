import SiteHeader from "@/components/navigation-bar/site-header";
import { Toaster } from "sonner";
import SiteFooter from "@/components/navigation-bar/site-footer";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div suppressHydrationWarning>
      <div data-wrapper="" className="border-border/40 dark:border-border">
        <div className="mx-auto w-full border-border/40 dark:border-border min-[1800px]:max-w-[1536px] min-[1800px]:border-x">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Toaster />
          {/* <SiteFooter /> */}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
