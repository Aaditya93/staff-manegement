import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import compress from "browser-image-compression";
import { updateUserBackgroundImage } from "@/actions/edit-profile/edit-profile";
import { getSignedURL } from "@/actions/edit-profile/upload-images";

import { useImageUpload } from "./use-image-upload";

export function ProfileBg({
  defaultImage,
  userId,
}: {
  defaultImage?: string;
  userId?: string;
}) {
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

  // Upload image to server
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

      if (!response.success) {
        throw new Error("Failed to get signed URL");
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

      setIsUploading(true);

      try {
        const imageUrl = await uploadImageToServer(file);
        await updateUserBackgroundImage(userId, imageUrl);
        toast.success("Background image updated");
        await session.update(); // Update session to reflect changes
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
        await session.update();
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
}
