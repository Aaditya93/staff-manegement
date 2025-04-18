import mongoose, { Document, Model, Schema } from "mongoose";
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
}

// Interface to define the Ticket document structure
export interface ITicket extends Document {
  _id: string;
  userId: string;
  agent: string;
  receivedDateTime: string;
  pax: number;
  ticketId?: string;
  destination: string;
  arrivalDate: Date;
  departureDate: Date;
  isApproved: boolean;
  reservationInCharge: string;
  salesInCharge: string;
  market: string;
  status: string;
  estimateTimeToSendPrice: number;
  cost: number;
  waitingTime: number;
  speed: string;
  inbox: number;
  sent: number;
  emailId: string;
  agentEmailId: string;
  lastMailTimeReceived: number;
  lastMailTimeSent: number;
  balance?: number;
  email: EmailEntry[];
  createdAt: Date;
  updatedAt: Date;
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
    from: {
      type: EmailFromSchema,
      required: true,
    },
    to: [EmailToSchema],
  },
  { _id: true }
); // Keep _id for email entries for better reference

// Define the schema for the Ticket model
const TicketSchema = new Schema<ITicket>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Add index for faster lookups by userId
    },
    agent: {
      type: String,
      required: true,
    },

    receivedDateTime: String,
    pax: {
      type: Number,
      default: 0,
      min: 0,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    destination: String,
    arrivalDate: Date,
    departureDate: Date,
    reservationInCharge: String,
    salesInCharge: String,
    market: String,
    status: {
      type: String,
      index: true, // Add index for faster status filtering
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
      type: Number,
      default: 0,
    },
    lastMailTimeSent: {
      type: Number,
      default: 0,
    },
    emailId: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    agentEmailId: {
      type: String,
      index: true,
      required: true,
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

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;
