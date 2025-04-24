interface SerializeOptions {
  handleDates?: boolean;
  handleObjectIds?: boolean;
}

export function serializeData<T>(obj: T, options: SerializeOptions = {}): T {
  if (!obj) {
    return {} as T;
  }

  try {
    // Use a WeakMap to track objects that have already been serialized
    const seen = new WeakMap();

    const serialized = JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.set(value, true);
      }

      if (value === undefined) {
        return null;
      }

      // Handle special types
      if (options.handleDates && value instanceof Date) {
        return value.toISOString();
      }

      if (options.handleObjectIds && value?._bsontype === "ObjectId") {
        return value.toString();
      }

      if (Array.isArray(value)) {
        return value.map((item) => (item === undefined ? null : item));
      }

      return value;
    });

    return JSON.parse(serialized);
  } catch (error) {
    console.error("Serialization failed:", error);
    return Array.isArray(obj) ? [] : ({} as T);
  }
}
