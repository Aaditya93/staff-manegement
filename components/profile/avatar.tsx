import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ImagePlus, Loader2 } from "lucide-react";
import { updateUserProfileImage } from "@/actions/edit-profile/edit-profile";

import { useImageUpload } from "./use-image-upload";

export function Avatar({
  defaultImage,
  userId,
}: {
  defaultImage?: string;
  userId?: string;
}) {
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
        const imageUrl = await uploadImageToServer(file);
        await updateUserProfileImage(userId, imageUrl);
        toast.success("Profile image updated");
        await session.update(); // Update session to reflect changes
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
}
