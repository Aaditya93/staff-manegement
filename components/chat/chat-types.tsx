export type Conversation = {
  _id: string;
  name?: string;
  isGroup: boolean;
  lastMessage?: {
    _id: string;
    content: string[];
    type: string;
    createdAt: string;
  };
  participants: {
    _id: string;
    name: string;
    image?: string;
  }[];
  updatedAt: string;
  unreadCount: number;
};

export type Message = {
  _id: string;

  type: string;
  content: string[];
  createdAt: string;
  updatedAt: string;
  seenBy?: {
    userId: string;
    seenAt: string;
  }[];
  status?: "sending" | "sent" | "failed";
};

export type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
};
