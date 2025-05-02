import * as React from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import Image from "next/image";

export const SiteFooter = () => {
  return (
    <footer className="bg-background p-8 text-foreground">
      <div className="container mx-auto space-y-8">
        <div className="flex justify-between items-center p-6 rounded-md bg-secondary">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">
              Victoria Tours
            </h2>
            <p className="text-muted-foreground mt-1">
              Your trusted travel partner
            </p>
          </div>
          <Button variant="outline">
            <a href="https://api.whatsapp.com/send/?phone=84915549136&text&type=phone_number&app_absent=0">
              Contact Us
            </a>
          </Button>
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
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
