import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import RedirectLogin from "@/components/auth/redirect-login";
import Link from "next/link";

const SignUpPage = () => {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      <div className="relative h-[300px] lg:h-full">
        <Image
          src="/travel-agent.jpg"
          alt="register"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black/30">
          <div className="absolute top-0 left-0 w-full p-6 flex items-center z-10">
            <Link href="/home" className="flex items-center">
              <Image
                src="/logo.png"
                width={50}
                height={50}
                alt="Victoria Tours"
                className="mr-3 bg-white/90 rounded-lg p-1"
              />
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                Victoria Tours
              </h1>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground z-10 p-4"></div>
      </div>
      <div>
        <RedirectLogin />
        <div className="flex min-h-screen items-center justify-center  py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Travel Agent Account
              </CardTitle>
              <CardDescription>
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <RegisterForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
