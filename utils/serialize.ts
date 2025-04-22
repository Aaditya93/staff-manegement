interface SerializeOptions {
  handleDates?: boolean;
  handleObjectIds?: boolean;
}
export function serializeData<T>(obj: T, options: SerializeOptions = {}): T {
  if (!obj) {
    return {} as T;
  }

  try {
    const serialized = JSON.stringify(obj, (key, value) => {
      if (value === undefined) {
        return null;
      }
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
