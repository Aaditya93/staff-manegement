"use client";

import { resetUserReviews, updateReview } from "@/actions/review/update-review";
import { Button } from "@/components/ui/button";

export const test = () => {
  return (
    <div>
      <h1>Test</h1>
      <p>This is a test page.</p>
      <Button onClick={() => updateReview()}>Click Me</Button>
    </div>
  );
};

export default test;
