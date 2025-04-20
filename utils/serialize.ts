/**
 * Recursively converts MongoDB documents and objects with toJSON methods
 * into plain JavaScript objects suitable for passing to client components
 */
export function serializeData<T>(
  data: T,
  seen = new WeakMap<object, boolean>()
): any {
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
    return data.map((item) => serializeData(item, seen));
  }

  // Handle objects
  if (typeof data === "object") {
    // Handle circular references
    if (seen.has(data as object)) {
      return null; // Break circular references
    }

    // Mark this object as seen
    seen.set(data as object, true);

    // Convert ObjectId to string if it has a toString method
    if (data._id && typeof data._id.toString === "function") {
      // Create a new object without recursively serializing data again
      const { _id, ...rest } = data as any;
      const serialized = serializeData(rest, seen);
      return {
        ...serialized,
        _id: _id.toString(),
      };
    }

    // Handle buffer objects often found in MongoDB ObjectIds
    if (data.buffer && data.toString) {
      return data.toString();
    }

    // Process regular objects recursively
    const serialized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as any)) {
      serialized[key] = serializeData(value, seen);
    }
    return serialized;
  }

  // Return primitives as is
  return data;
}
