"use client";
import compress from "browser-image-compression";
import { MutipleEmailSignIn } from "@/actions/auth/sign-out";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, Plus, Trash, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useId, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getSignedURL } from "@/actions/edit-profile/upload-images";
// Server actions for profile updates
import {
  updateUserName,
  updateUserCountry,
  updateUserProfileImage,
  updateUserBackgroundImage,
} from "@/actions/edit-profile/edit-profile";

// Image upload hook
const useImageUpload = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open file dialog
  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and show preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clear preview
  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
};

export function EditProfile() {
  const id = useId();
  const session = useSession();
  const user = session.data?.user;

  const [isMounted, setIsMounted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [name, setName] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update email in the list
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Add a new email to the account
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

  // Remove an email from the list
  const removeEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
  };

  useEffect(() => {
    setIsMounted(true);
    // Set initial values from user data when session loads
    if (user) {
      setName(user.name || "");
      setSelectedCountry(user.country || "us");
      setEmails(user.accounts?.map((account) => account.email) || []);
    }
  }, [user]);

  // Function to handle profile save
  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      // Update name
      const nameResult = await updateUserName(user.id, name);
      if (!nameResult.success) throw new Error(nameResult.error);

      // Update country
      const countryResult = await updateUserCountry(user.id, selectedCountry);
      if (!countryResult.success) throw new Error(countryResult.error);

      toast.success("Profile updated successfully");

      // Force session refresh to show updated data
      session.update();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Return a placeholder during server-side rendering
  if (!isMounted) {
    return <Button variant="outline">Edit profile</Button>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set a
          username.
        </DialogDescription>
        <div className="overflow-y-auto">
          <ProfileBg
            defaultImage="https://originui.com/profile-bg.jpg"
            userId={user?.id}
          />
          <Avatar
            defaultImage="https://originui.com/avatar-72-01.jpg"
            userId={user?.id}
          />
          <div className="px-6 pb-6 pt-4">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                        <Loader2 size={16} className="animate-spin mr-1" />
                      ) : (
                        <>
                          <Plus size={16} className="mr-1" /> Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-country`}>Country</Label>
                <Select
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                >
                  <SelectTrigger id={`${id}-country`}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
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
            </form>
          </div>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ProfileBg = ({
  defaultImage,
  userId,
}: {
  defaultImage?: string;
  userId?: string;
}) => {
  const session = useSession();
  const user = session.data?.user;

  const [hideDefault, setHideDefault] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange: originalHandleFileChange,
    handleRemove,
  } = useImageUpload();

  const currentImage =
    previewUrl || (!hideDefault ? user?.backgroundImage || defaultImage : null);

  // Simulate file upload (replace in production)
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      // Compress the image if it's over 1MB and is an image file
      let fileToUpload = file;
      if (file.type.startsWith("image/") && file.size > 1024 * 1024) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        try {
          fileToUpload = await compress(file, options);
          console.log(`Original file size: ${file.size / 1024 / 1024} MB`);
          console.log(
            `Compressed file size: ${fileToUpload.size / 1024 / 1024} MB`
          );
        } catch (compressionError) {
          console.error("Image compression failed:", compressionError);
          // Continue with original file if compression fails
        }
      }

      // Generate a unique key for the image
      const fileType = fileToUpload.type;
      const fileSize = fileToUpload.size;
      const fileName = `${Date.now()}-${file.name}`;
      const key = `profile-images/${fileName}`;

      // Calculate checksum for the file
      const fileArrayBuffer = await fileToUpload.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", fileArrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = btoa(String.fromCharCode.apply(null, hashArray));

      // Get a signed URL from the server
      const response = await getSignedURL({
        fileType,
        fileSize,
        checksum,
        key,
      });

      if (response.failure) {
        throw new Error(response.failure);
      }

      const { url } = response.success;

      // Upload the file to S3 using the signed URL
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
          "Content-Length": fileSize.toString(),
        },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Return the public URL for the uploaded image
      const publicUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    originalHandleFileChange(e);

    // Now handle uploading to server
    if (e.target.files?.[0] && userId) {
      const file = e.target.files[0];

      // In a real application, implement file upload to a service like S3
      // For this example, we'll simulate with a timeout
      setIsUploading(true);

      try {
        // For a real app, implement actual file upload here
        // This is just a placeholder for demonstration
        const imageUrl = await uploadImageToServer(file);
        await updateUserBackgroundImage(userId, imageUrl);
        toast.success("Background image updated");
        session.update(); // Update session to reflect changes
      } catch (error) {
        toast.error("Failed to update background image");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleImageRemove = async () => {
    handleRemove();
    setHideDefault(true);

    if (userId) {
      try {
        await updateUserBackgroundImage(userId, "");
        toast.success("Background image removed");
        session.update();
      } catch (error) {
        toast.error("Failed to remove background image");
        console.error(error);
      }
    }
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
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            disabled={isUploading}
            aria-label={currentImage ? "Change image" : "Upload image"}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
          {currentImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline-ring/70"
              onClick={handleImageRemove}
              disabled={isUploading}
              aria-label="Remove image"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
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

const Avatar = ({
  defaultImage,
  userId,
}: {
  defaultImage?: string;
  userId?: string;
}) => {
  const session = useSession();
  const user = session.data?.user;
  const [isUploading, setIsUploading] = useState(false);

  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange: originalHandleFileChange,
  } = useImageUpload();

  const currentImage = previewUrl || user?.image || defaultImage;

  // Simulate file upload (replace in production)
  const uploadImageToServer = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, return the URL from your file storage
        const fakeUrl = URL.createObjectURL(file);
        resolve(fakeUrl);
      }, 1000);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    originalHandleFileChange(e);

    // Now handle uploading to server
    if (e.target.files?.[0] && userId) {
      const file = e.target.files[0];

      setIsUploading(true);

      try {
        // For a real app, implement actual file upload here
        // This is just a placeholder for demonstration
        const imageUrl = await uploadImageToServer(file);
        await updateUserProfileImage(userId, imageUrl);
        toast.success("Profile image updated");
        session.update(); // Update session to reflect changes
      } catch (error) {
        toast.error("Failed to update profile image");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

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
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          disabled={isUploading}
          aria-label="Change profile picture"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
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
