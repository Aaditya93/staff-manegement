import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserAuthForm } from "@/components/auth/authUserForm";

export const metadata: Metadata = {
  title: "Authentication For Victoria Tours",
  description:
    "Authentication forms For Victoria Tours's Staff-Management Application",
};

export default function AuthenticationPage() {
  return (
    <>
      <div className="md:hidden">
        <div className="flex justify-center items-center p-4">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="Victoria Tours"
            className="mr-2"
          />
          <h1 className="text-xl font-semibold">Victoria Tours</h1>
        </div>
      </div>
      <div className="container relative min-h-screen flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="Victoria Tours"
              className="mr-2"
            />
            <Link href="/home" className=" transition-colors">
              Victoria Tours
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Victoria Tours delivers exceptional travel experiences with the
                best prices for travel agents. We create unique and customized
                travel packages that exceed expectations while providing great
                value.
              </p>
              <footer className="text-sm">
                Built by - Arc Aaditya Shewale
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="w-full px-4 py-8 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Login to your account
              </h1>
            </div>
            <UserAuthForm />
            <p className="px-4 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
