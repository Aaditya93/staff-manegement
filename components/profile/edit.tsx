"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateUserName,
  updateUserCountry,
} from "@/actions/edit-profile/edit-profile";
import { ProfileBg } from "./profileBg";
import { Avatar } from "./avatar";
import { UserDetailsForm } from "./user-details-form";

interface EditProfileProps {
  initialName: string;
  initialCountry: string;
  initialEmails: string[];
  userId: string;
}

export function EditProfile({
  initialName,
  initialCountry,
  initialEmails,
  userId,
}: EditProfileProps) {
  const { update: updateSession } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [name, setName] = useState(initialName);
  const [emails, setEmails] = useState<string[]>(initialEmails);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to update state when props change
  useEffect(() => {
    setName(initialName);
    setSelectedCountry(initialCountry);
    setEmails(initialEmails);
  }, [initialName, initialCountry, initialEmails]);

  // Function to handle profile save
  const handleSaveProfile = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      // Update name
      const nameResult = await updateUserName(userId, name);
      if (!nameResult.success) throw new Error(nameResult.error);

      // Update country
      const countryResult = await updateUserCountry(userId, selectedCountry);
      if (!countryResult.success) throw new Error(countryResult.error);

      toast.success("Profile updated successfully");

      // Force session refresh to show updated data
      await updateSession();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Return a placeholder during client-side hydration
  if (!isMounted) {
    return <div>Loading profile editor...</div>;
  }

  return (
    <div className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg border border-border rounded-md">
      <div className="border-b border-border px-6 py-4 text-base font-semibold">
        Edit profile
      </div>
      <div className="overflow-y-auto">
        <ProfileBg
          defaultImage="https://originui.com/profile-bg.jpg"
          userId={userId}
        />
        <Avatar
          defaultImage="https://originui.com/avatar-72-01.jpg"
          userId={userId}
        />
        <div className="px-6 pb-6 pt-4">
          <UserDetailsForm
            initialName={name}
            initialCountry={selectedCountry}
            initialEmails={emails}
            onNameChange={setName}
            onCountryChange={setSelectedCountry}
          />
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 flex justify-end gap-2">
        <Button type="button" onClick={handleSaveProfile} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}
