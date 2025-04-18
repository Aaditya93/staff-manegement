"use client";

import { MutipleEmailSignIn } from "@/actions/auth/sign-out";
import { useImageUpload } from "./use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, Plus, Trash, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { toast } from "sonner";

import { updateProfile } from "@/actions/edit-profile/edit-profile";

interface Account {
  email: string;
  provider: string;
  _id?: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  backgroundImage?: string;
  accounts: Account[];
}

interface EditProfileProps {
  userData: UserData;
}

export function EditProfile({ userData }: EditProfileProps) {
  const id = useId();

  const [selectedCountry, setSelectedCountry] = useState("us");
  // Initialize with user's name
  const [name, setName] = useState(userData.name || "");
  const [accountType, setAccountType] = useState("");
  // Get unique emails from the accounts array
  const uniqueEmails = [
    ...new Set(userData.accounts.map((account) => account.email)),
  ];
  const [emails, setEmails] = useState(uniqueEmails);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleAddEmail = async () => {
    if (!newEmailInput || !newEmailInput.includes("@")) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsAddingEmail(true);

    try {
      await MutipleEmailSignIn(newEmailInput);

      // Update the UI
      setEmails([...emails, newEmailInput]);
      setNewEmailInput("");

      toast.success("Email added", {
        description: "The email has been linked to your account",
      });
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error("Failed to add email. Please try again.");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const removeEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
  };

  const handleSaveChanges = async () => {
    try {
      // Pass accountType to the updateProfile action
      const result = await updateProfile(selectedCountry, name, accountType);

      if (result.success) {
        toast.success("Profile updated", {
          description: "Your profile changes have been saved",
        });
      } else {
        toast.error("Failed to update profile", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred", {
        description: "Could not save your profile changes",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <div className="overflow-y-auto">
          <ProfileBg
            defaultImage={
              userData.backgroundImage || "https://originui.com/profile-bg.jpg"
            }
          />
          <Avatar
            defaultImage={
              userData.image || "https://originui.com/avatar-72-01.jpg"
            }
          />
          <div className="px-6 pb-6 pt-4">
            <h1 className="mb-6 text-xl font-semibold">Edit Profile</h1>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-full-name`}>Full name</Label>
                <Input
                  id={`${id}-full-name`}
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email addresses</Label>
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        required={index === 0}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeEmail(index)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add input for new email */}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="New email address"
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={handleAddEmail}
                      disabled={isAddingEmail}
                    >
                      {isAddingEmail ? (
                        <span className="inline-flex items-center">
                          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Loading
                        </span>
                      ) : (
                        <>
                          <Plus size={16} className="mr-1" /> Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Account Type Selector - Removed flex-1 */}
                <div className="space-y-2">
                  {" "}
                  {/* Removed flex-1 */}
                  <Label htmlFor={`${id}-account-type`}>Account Type</Label>
                  <Select
                    value={accountType}
                    onValueChange={(value) =>
                      setAccountType(value as "SalesStaff" | "ReservationStaff")
                    }
                  >
                    {/* Set a specific width for the trigger */}
                    <SelectTrigger
                      id={`${id}-account-type`}
                      className="w-[180px] "
                    >
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SalesStaff">Sales Staff</SelectItem>
                      <SelectItem value="ReservationStaff">
                        Reservation Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Selector - Removed flex-1 */}
                <div className="space-y-2">
                  {" "}
                  {/* Removed flex-1 */}
                  <Label htmlFor={`${id}-country`}>Country</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    {/* Set a specific width for the trigger */}
                    <SelectTrigger id={`${id}-country`} className="w-[180px] ">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add more countries as needed */}
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="br">Brazil</SelectItem>
                      <SelectItem value="mx">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button type="button" onClick={handleSaveChanges}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
const ProfileBg = ({ defaultImage }: { defaultImage?: string }) => {
  const [hideDefault, setHideDefault] = useState(false);
  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isUploading,
  } = useImageUpload({
    type: "background",
  });

  const currentImage = previewUrl || (!hideDefault ? defaultImage : null);

  const handleImageRemove = () => {
    handleRemove();
    setHideDefault(true);
  };

  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-muted">
        {currentImage && (
          <Image
            className="h-full w-full object-cover"
            src={currentImage}
            alt={
              previewUrl
                ? "Preview of uploaded image"
                : "Default profile background"
            }
            fill
            priority
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {isUploading ? (
            <div className="z-50 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-white">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline-ring/70"
                onClick={handleThumbnailClick}
                aria-label={currentImage ? "Change image" : "Upload image"}
              >
                <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              {currentImage && (
                <button
                  type="button"
                  className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline-ring/70"
                  onClick={handleImageRemove}
                  aria-label="Remove image"
                >
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Upload image file"
      />
    </div>
  );
};

const Avatar = ({ defaultImage }: { defaultImage?: string }) => {
  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    isUploading,
  } = useImageUpload({
    type: "profile",
  });

  const currentImage = previewUrl || defaultImage;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm shadow-black/10">
        {currentImage && (
          <Image
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
            priority
          />
        )}
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          </div>
        ) : (
          <button
            type="button"
            className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            aria-label="Change profile picture"
          >
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
};
