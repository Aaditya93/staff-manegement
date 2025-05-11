"use client";

import { updateReview } from "@/actions/review/update-review";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ReviewPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: any;
  } | null>(null);

  const handleUpdateReview = async () => {
    try {
      setIsLoading(true);
      const response = await updateReview();
      setResult(response);
    } catch (error) {
      console.error("Error updating reviews:", error);
      setResult({ success: false, error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Review Page</h1>
      <Button
        variant="default"
        onClick={handleUpdateReview}
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update Reviews"}
      </Button>

      {result && (
        <div
          className={`mt-4 p-4 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}
        >
          {result.success ? (
            <p className="text-green-700">{result.message}</p>
          ) : (
            <p className="text-red-700">Error: {result.error?.toString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
