export interface EmailFrom {
  name: string;
  email: string;
}

export interface EmailTo {
  name: string;
  email: string;
}

export interface EmailEntry {
  id: string;
  emailSummary: string;
  rating: number;
  weblink?: string;
  emailType?: string;
  from: EmailFrom;
  to: EmailTo[];
  timestamp: Date;
}

export interface PersonnelInfo {
  name: string;
  emailId: string;
}
