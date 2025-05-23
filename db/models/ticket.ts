import { Schema, Document } from "mongoose";

import mongoose from "mongoose";

// Email sub-document interfaces for better type safety
interface EmailFrom {
  name: string;
  email: string;
}

interface EmailTo {
  name: string;
  email: string;
}

interface EmailEntry {
  id: string;
  emailSummary: string;
  rating: number;
  weblink?: string;
  emailType?: string;
  from: EmailFrom;
  to: EmailTo[];
  timestamp: Date; // Optional timestamp for email entries
}

interface PersonnelInfo {
  id?: string;
  name: string;
  emailId: string;
}

// Interface to define the Ticket document structure
export interface ITicket extends Document {
  companyName: string;
  _id: string;
  receivedDateTime: Date;
  sentDateTime?: Date;
  pax: number;
  destination: string;
  arrivalDate?: Date;
  departureDate?: Date;
  isApproved: boolean;
  reservationInCharge: PersonnelInfo; // Changed to PersonnelInfo type
  salesInCharge: PersonnelInfo; // Changed to PersonnelInfo type
  travelAgent: PersonnelInfo; // Added new field
  createdBy: PersonnelInfo;
  market: string;
  status: string;
  estimateTimeToSendPrice: number;
  cost: number;
  waitingTime: number;
  approvedBy: PersonnelInfo;
  speed: string;
  inbox: number;
  sent: number;
  lastMailTimeReceived: Date;
  lastMailTimeSent: Date;
  balance?: number;
  email: EmailEntry[];
  review: Review;
  createdAt: Date;
  updatedAt: Date;
}
interface Review {
  attitude: number;
  knowledge: number;
  speed: number;
  hotel: number;
  guide: number;
  transfer: number;
  meal: number;
  reviewText?: string;
  reviewDate: Date;
}

// Define email sub-schemas to improve structure
const EmailFromSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

const EmailToSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);

const EmailEntrySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },

    emailSummary: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    weblink: String,
    emailType: String,
    timestamp: {
      type: Date,
    },
    from: {
      type: EmailFromSchema,
      required: true,
    },
    to: [EmailToSchema],
  },
  { _id: true }
); // Keep _id for email entries for better reference

// Define schema for personnel info
const PersonnelSchema = new Schema(
  {
    id: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false }
);
const ReviewSchema = new Schema(
  {
    attitude: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    knowledge: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    speed: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    reviewTitle: {
      type: String,
      required: false,
    },

    positiveText: {
      type: String,
      required: false,
    },
    negativeText: {
      type: String,
      required: false,
    },
    userRole: {
      type: String,
      required: false,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Define the schema for the Ticket model
const TicketSchema = new Schema<ITicket>(
  {
    receivedDateTime: Date,
    sentDateTime: Date,
    pax: {
      type: Number,
      default: 0,
      min: 0,
    },
    companyName: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    destination: String,
    arrivalDate: Date,
    departureDate: Date,
    reservationInCharge: {
      type: PersonnelSchema,
    },
    salesInCharge: {
      type: PersonnelSchema,
    },
    travelAgent: {
      type: PersonnelSchema,
    },
    approvedBy: {
      type: PersonnelSchema,
    },
    market: String,
    status: {
      type: String,
    },
    estimateTimeToSendPrice: Number,
    waitingTime: {
      type: Number,
      min: 0,
    },
    speed: String,
    inbox: {
      type: Number,
      default: 0,
      min: 0,
    },
    sent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMailTimeReceived: {
      type: Date,
    },
    lastMailTimeSent: {
      type: Date,
    },
    balance: Number,
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    review: ReviewSchema,
    createdBy: {
      type: PersonnelSchema,
    },
    email: [EmailEntrySchema],
  },
  {
    timestamps: true,
  }
);

TicketSchema.statics.findByTicketNo = function (ticketNo: number) {
  return this.findOne({ ticketNo });
};

// Add virtual property for ticket age
TicketSchema.virtual("ticketAge").get(function (this: ITicket) {
  return new Date().getTime() - this.createdAt.getTime();
});

// Create and export the Ticket model

const Ticket = (mongoose.models?.Ticket ||
  mongoose.model("Ticket", TicketSchema)) as mongoose.Model<ITicket>;

export default Ticket;
