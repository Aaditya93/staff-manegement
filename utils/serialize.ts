/**
 * Recursively converts MongoDB documents and objects with toJSON methods
 * into plain JavaScript objects suitable for passing to client components
 */
export function serializeData<T>(data: T): any {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item));
  }

  // Handle objects
  if (typeof data === "object") {
    // Convert ObjectId to string if it has a toString method
    if (data._id && typeof data._id.toString === "function") {
      return {
        ...serializeData({ ...data }),
        _id: data._id.toString(),
      };
    }

    // Handle buffer objects often found in MongoDB ObjectIds
    if (data.buffer && data.toString) {
      return data.toString();
    }

    // Process regular objects recursively
    const serialized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }

  // Return primitives as is
  return data;
}
