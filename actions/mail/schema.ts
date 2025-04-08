"use server";

import { z } from "zod";

// Schema for email filtering
export const EmailFilterSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  skip: z.number().min(0).default(0),
  filterUnread: z.boolean().optional(),
  searchQuery: z.string().optional(),
  folderName: z.string().optional(),
});
