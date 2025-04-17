"use client";
import { getSignedURL } from "@/actions/edit-profile/upload-images";
import {
  updateProfileImage,
  updateBackgroundImage,
} from "@/actions/edit-profile/update-image-url";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseImageUploadProps {
  onUpload?: (url: string) => void;
  type?: "profile" | "background";
}

export function useImageUpload({
  onUpload,
  type = "profile",
}: UseImageUploadProps = {}) {
  const session = useSession();
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);
        setFileName(file.name);

        // Create temporary preview
        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);

        // Calculate checksum
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Generate a key for S3
        const uuid = crypto.randomUUID();
        const fileExtension = file.name.split(".").pop();
        const uniqueKey = `${type}/${session.data?.user.id}/images/${uuid}.${fileExtension}`;

        // Get signed URL
        const response = await getSignedURL({
          fileType: file.type,
          fileSize: file.size,
          checksum: hashHex,
          key: uniqueKey,
        });

        if (response.failure || !response.success) {
          throw new Error(response.failure || "Failed to get signed URL");
        }

        // Upload to S3
        const uploadResult = await fetch(response.success.url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
            "Content-Length": file.size.toString(),
          },
        });

        if (!uploadResult.ok) {
          throw new Error("Failed to upload to S3");
        }

        // Construct the final S3 URL
        const s3Url = `${process.env.NEXT_PUBLIC_S3_AWS_URL}${uniqueKey}`;

        URL.revokeObjectURL(localPreviewUrl);
        setPreviewUrl(s3Url);
        previewRef.current = s3Url;

        // Update image in database based on type
        let updateResult;
        if (type === "profile") {
          updateResult = await updateProfileImage(s3Url);
        } else {
          updateResult = await updateBackgroundImage(s3Url);
        }

        if (!updateResult.success) {
          throw new Error(`Failed to update ${type} image in database`);
        }

        // Notify parent component
        onUpload?.(s3Url);

        toast.success(
          `${
            type === "profile" ? "Profile" : "Background"
          } image uploaded successfully`
        );
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Failed to upload ${type} image`);

        // Reset to previous state
        handleRemove();
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, type, session.data?.user.id]
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      // Only revoke if it's an object URL (not an S3 URL)
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewRef.current && previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isUploading,
  };
}
