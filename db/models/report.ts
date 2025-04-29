import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  title: string;
  description: string;
  ticketId: mongoose.Types.ObjectId;
  salesId?: mongoose.Types.ObjectId;
  reservationId?: mongoose.Types.ObjectId;

  travelAgentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  complaintType: "service" | "product" | "staff" | "billing" | "other";
  userId: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const ReportSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Report title is required"],
    },
    description: {
      type: String,
      required: [true, "Report description is required"],
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    travelAgentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    salesId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    complaintType: {
      type: String,
      enum: ["service", "product", "staff", "billing", "other"],
      required: [true, "Complaint type is required"],
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Report = (mongoose.models?.Report ||
  mongoose.model("Report", ReportSchema)) as mongoose.Model<IReport>;

export default Report;
