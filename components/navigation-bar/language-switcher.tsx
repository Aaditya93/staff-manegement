"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";
// Define language options with their metadata
const languages = {
  en: {
    name: "English",
    flag: "/US.svg",
    alt: "US Flag",
  },
  zh: {
    name: "中文",
    flag: "/CN.svg",
    alt: "Chinese Flag",
  },
};

export const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Detect current language from URL on component mount
  useEffect(() => {
    const locale = pathname.split("/")[1];
    if (locale in languages) {
      setSelectedLanguage(locale);
    } else {
      setSelectedLanguage("en"); // Default language
    }
  }, [pathname]);

  const switchLanguage = (locale) => {
    // Get current path without locale prefix
    const currentPath = pathname.replace(/^\/[^\/]+/, "") || "/";

    // Navigate to the same page with updated locale
    router.push(`/${locale}${currentPath}`);
    setSelectedLanguage(locale);
  };

  const currentLang = languages[selectedLanguage] || languages.en;
  const t = useTranslations("navbar");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="items-start justify-start pl-0 pt-2 pb-0"
        >
          <Image
            src={currentLang.flag}
            alt={currentLang.alt}
            width={18}
            height={18}
            className="rounded-full"
            style={{ aspectRatio: "24/24", objectFit: "cover" }}
          />
          <span className="font-medium">{currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>{t("select")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => switchLanguage("en")}>
            <div className="flex items-center gap-2">
              <Image
                src={languages.en.flag}
                alt={languages.en.alt}
                width={18}
                height={18}
                className="rounded-full"
                style={{ aspectRatio: "24/24", objectFit: "cover" }}
              />
              <span>{languages.en.name}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchLanguage("zh")}>
            <div className="flex items-center gap-2">
              <Image
                src={languages.zh.flag}
                alt={languages.zh.alt}
                width={18}
                height={18}
                className="rounded-full"
                style={{ aspectRatio: "24/24", objectFit: "cover" }}
              />
              <span>{languages.zh.name}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
