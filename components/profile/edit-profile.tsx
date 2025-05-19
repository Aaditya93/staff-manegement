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
import { Switch } from "@/components/ui/switch";
import { updateUserStatus } from "@/actions/edit-profile/edit-profile";
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
  role: string;
  destination: string;
  department?: string;
  status?: string;
  phoneNumber?: string; // Add phone number field

  // Add potential fields if they exist in the user data
  office?: string;
  position?: string;
}

interface EditProfileProps {
  userData: UserData;
}

export function EditProfile({ userData }: EditProfileProps) {
  const id = useId();

  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    userData.destination && Array.isArray(userData.destination)
      ? userData.destination
      : userData.destination
        ? [userData.destination]
        : []
  );
  const [name, setName] = useState(userData.name || "");
  const [accountType, setAccountType] = useState(userData.role || ""); // Default or from userData
  const [selectedOffice, setSelectedOffice] = useState(userData.office || ""); // Initialize office state
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || ""); // Initialize phone number state
  const [selectedPosition, setSelectedPosition] = useState(
    userData.position || ""
  ); // Initialize position state
  const [selectedDepartment, setSelectedDepartment] = useState(
    userData.department || ""
  ); // Initialize department state

  // Get unique emails from the accounts array
  const uniqueEmails = [
    ...new Set(userData.accounts.map((account) => account.email)),
  ];
  const [emails, setEmails] = useState(uniqueEmails);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isAvailable, setIsAvailable] = useState(
    userData.status === "Available"
  );

  // Add this function to handle status changes
  const handleStatusChange = async (checked: boolean) => {
    setIsAvailable(checked);
    const newStatus = checked ? "Available" : "Busy";

    try {
      const result = await updateUserStatus(newStatus);

      if (result.success) {
        toast.success("Status updated", {
          description: `You are now ${newStatus}`,
        });
      } else {
        toast.error("Failed to update status", {
          description: result.message,
        });
        // Revert UI state if server update failed
        setIsAvailable(!checked);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred", {
        description: "Could not update your status",
      });
      // Revert UI state if there was an error
      setIsAvailable(!checked);
    }
  };

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
      // Pass accountType, office, and position to the updateProfile action
      // Note: You might need to update the `updateProfile` action signature
      const result = await updateProfile(
        selectedCountries, // Pass array of destinations
        name,
        accountType,
        selectedOffice, // Pass office
        selectedPosition, // Pass position
        selectedDepartment, // Pass department
        phoneNumber
      );

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
    <div className="w-full max-w-3xl mx-auto ">
      <div className=" rounded-lg border border-border bg-background shadow-sm">
        <div className="overflow-y-auto ">
          <ProfileBg
            defaultImage={
              userData.backgroundImage || "https://originui.com/profile-bg.jpg"
            }
          />
          <div className="grid grid-cols-2">
            <Avatar
              defaultImage={
                userData.image || "https://originui.com/avatar-72-01.jpg"
              }
            />

            <div className="flex items-center justify-end px-6 ">
              <div className="flex items-center gap-2 text-md">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <Label
                  htmlFor="status-toggle"
                  className="text-sm whitespace-nowrap"
                >
                  {isAvailable ? "Available" : "Busy"}
                </Label>
                <Switch
                  id="status-toggle"
                  checked={isAvailable}
                  onCheckedChange={handleStatusChange}
                  className="ml-1.5  "
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4">
            {/* <h1 className="mb-6 text-xl font-semibold">Edit Profile</h1> */}
            <form className="space-y-4">
              <div className=" grid grid-cols-2 gap-4">
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
                  <Label htmlFor={`${id}-phone-number`}>Phone Number</Label>
                  <Input
                    id={`${id}-phone-number`}
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                  />
                </div>
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
              {/* Grid layout for selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {/* Account Type Selector */}
                <div className="space-y-2">
                  <Label htmlFor={`${id}-account-type`}>Account Type</Label>
                  <Select
                    value={accountType}
                    onValueChange={(value) =>
                      setAccountType(value as "SalesStaff" | "ReservationStaff")
                    }
                  >
                    <SelectTrigger id={`${id}-account-type`} className="w-full">
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

                {/* Destination Selector */}

                {/* Office Selector */}
                <div className="space-y-2">
                  <Label htmlFor={`${id}-office`}>Office</Label>
                  <Select
                    value={selectedOffice}
                    onValueChange={setSelectedOffice}
                  >
                    <SelectTrigger id={`${id}-office`} className="w-full">
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hanoi office - Vietnam">
                        Hanoi office - Vietnam
                      </SelectItem>
                      <SelectItem value="Da Nang office - Vietnam">
                        Da Nang office - Vietnam
                      </SelectItem>
                      <SelectItem value="Mumbai office">
                        Mumbai office
                      </SelectItem>
                      <SelectItem value="Kolkata office">
                        Kolkata office
                      </SelectItem>
                      <SelectItem value="Malaysia Office">
                        Malaysia Office
                      </SelectItem>
                      <SelectItem value="Singapore office">
                        Singapore office
                      </SelectItem>
                      <SelectItem value="Thailand office">
                        Thailand office
                      </SelectItem>
                      <SelectItem value="Sri Lanka office">
                        Sri Lanka office
                      </SelectItem>
                      <SelectItem value="Bangladesh office">
                        Bangladesh office
                      </SelectItem>
                      <SelectItem value="China office">China office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-department`}>Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger id={`${id}-department`} className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Sales Manager">
                        Sales Manager
                      </SelectItem>
                      <SelectItem value="Reservation">Reservation</SelectItem>
                      <SelectItem value="Accounting">Accounting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Position Selector */}
                <div className="space-y-2">
                  <Label htmlFor={`${id}-position`}>Position</Label>
                  <Select
                    value={selectedPosition}
                    onValueChange={setSelectedPosition}
                  >
                    <SelectTrigger id={`${id}-position`} className="w-full">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add position options here */}
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Team Lead">Team Lead</SelectItem>
                      <SelectItem value="Senior Staff">Senior Staff</SelectItem>
                      <SelectItem value="Junior Staff">Junior Staff</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      {/* Add more positions as needed */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${id}-Destination`}>Destinations</Label>
                  <div className="flex flex-col ">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCountries?.map((country) => (
                        <div
                          key={country}
                          className="flex items-center bg-primary/10 text-sm rounded-md px-2 "
                        >
                          <span>{country}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCountries(
                                selectedCountries.filter((c) => c !== country)
                              );
                            }}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (value && !selectedCountries?.includes(value)) {
                          setSelectedCountries([...selectedCountries, value]);
                        }
                      }}
                    >
                      <SelectTrigger
                        id={`${id}-Destination`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Add destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add more countries as needed */}
                        <SelectItem value="Vietnam">Vietnam</SelectItem>
                        <SelectItem value="Singapore">Singapore</SelectItem>
                        <SelectItem value="Thailand">Thailand</SelectItem>
                        <SelectItem value="Malaysia">Malaysia</SelectItem>
                        <SelectItem value="Indonesia">Indonesia</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="Taiwan">Taiwan</SelectItem>
                        <SelectItem value="Nepal">Nepal</SelectItem>
                        <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Italia">Italia</SelectItem>
                        <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                        <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                        <SelectItem value="Cambodia">Cambodia</SelectItem>
                        <SelectItem value="Laos">Laos</SelectItem>
                        <SelectItem value="Myanmar">Myanmar</SelectItem>
                        <SelectItem value="Pakistan">Pakistan</SelectItem>
                        <SelectItem value="Philippines">Philippines</SelectItem>
                        <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                        <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

// ... rest of the component (ProfileBg, Avatar) remains the same ...

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
