import * as React from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="bg-background p-8 text-foreground">
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 rounded-lg  shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Victoria Tours"
                width={36}
                height={36}
                className="rounded-md"
              />
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                Victoria Tours
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Your trusted travel partner for unforgettable journeys and
              exceptional experiences around the world.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="default"
              size="lg"
              className="gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Phone className="h-4 w-4" />
              <a href="tel:+84974993215">Call Us</a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary/20 hover:bg-primary/10 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <a href="https://api.whatsapp.com/send/?phone=84915549136&text&type=phone_number&app_absent=0">
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Contact & Social Media */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex items-center space-x-6">
            <div className="bg-background p-2 rounded">
              <Image
                className="rounded-lg"
                width={80}
                height={80}
                src="/logo.png"
                alt="Victoria Tours "
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>+84 974 993 215</p>
              <p>sale20@victoriatour.com.vn</p>
              <p>
                No. 29, Pham Van Bach Street, Yen Hoa Ward, Cau Giay District
              </p>
            </div>
          </div>
          {/* <div className="flex space-x-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <i className="fab fa-facebook-f"></i> Facebook
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <i className="fab fa-twitter"></i> X
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <i className="fab fa-instagram"></i> Instagram
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <i className="fab fa-linkedin-in"></i> LinkedIn
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <i className="fab fa-youtube"></i> Youtube
            </a>
          </div> */}
        </div>

        <Separator className="bg-border" />

        {/* Footer Bottom */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Victoria Tours. All rights
            reserved.
          </p>
          <p>Terms of Service | Privacy Policy</p>
          <p>
            Built by{" "}
            <a
              href="https://api.whatsapp.com/send/?phone=8104328583&text&type=phone_number&app_absent=0"
              className="text-primary hover:underline"
            >
              Arc - Aaditya Shewale
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
