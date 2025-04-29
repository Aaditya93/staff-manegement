import dbConnect from "@/db/db";
import User from "@/db/models/User";
import { serializeData } from "@/utils/serialize";

export const getAllEmployees = async () => {
  try {
    await dbConnect();
    const Employees = await User.find({
      role: ["SalesStaff", "ReservationStaff"],
    }).lean();
    const serailizedEmployees = await serializeData(Employees);
    return serailizedEmployees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
};
