import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const Domain = process.env.DOMAIN;
export const sendVarificationEmail = async (email: string, token: string) => {
  const ConfirmationLink = `${Domain}/auth/travel-agent/new-verification?token=${token}`;

  await resend.emails.send({
    from: "Victoria Tours <noreply@victoriatour.vn>",
    to: email,
    subject: "Account Approved - Victoria Tours",
    html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Victoria Tours</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #374151; /* Slightly softer black */
        max-width: 600px;
        margin: 20px auto; /* Add margin top/bottom */
        padding: 0 15px; /* Add horizontal padding */
        background-color: #f3f4f6; /* Lighter gray background */
      }
      .container {
        background-color: #ffffff;
        border-radius: 10px; /* Slightly smaller radius */
        padding: 35px 45px; /* Adjust padding */
        box-shadow: 0 4px 12px rgba(0,0,0,0.06); /* Softer shadow */
        border: 1px solid #e5e7eb; /* Subtle border */
      }
      .logo {
        text-align: center;
        margin-bottom: 25px;
      }
      .logo h1 { /* Style the H1 in the logo div */
        color: #1e40af; /* Example brand color (blue) */
        font-weight: 700;
        font-size: 26px;
        margin: 0;
      }
      .title {
        color: #1f2937; /* Darker heading color */
        text-align: center;
        margin-bottom: 20px;
        font-size: 24px; /* Slightly smaller */
        font-weight: 600;
      }
      .verification-text {
        text-align: center;
        margin-bottom: 30px;
        color: #4b5563; /* Slightly darker gray */
        font-size: 15px;
        line-height: 1.7;
      }
      .button-container { /* Add container for centering */
        text-align: center;
        margin-bottom: 35px;
      }
      .verify-button {
        display: inline-block; /* Changed from block */
        background-color: #2563eb; /* Brighter blue */
        color: #ffffff !important; /* Ensure white text, !important for compatibility */
        text-align: center;
        padding: 12px 30px; /* Adjust padding */
        text-decoration: none;
        border-radius: 8px; /* More rounded */
        font-weight: 600; /* Bold */
        font-size: 16px;
        border: none; /* Remove default border */
        cursor: pointer;
        transition: background-color 0.25s ease;
      }
      .verify-button:hover {
        background-color: #1d4ed8; /* Darker blue on hover */
      }
      .footer {
        text-align: center;
        margin-top: 35px;
        padding-top: 25px;
        border-top: 1px solid #e5e7eb; /* Match border color */
        font-size: 12px; /* Smaller footer text */
        color: #6b7280; /* Lighter gray for footer */
      }
      .footer p {
        margin: 5px 0; /* Add spacing between footer paragraphs */
      }
      @media screen and (max-width: 600px) {
        body {
          padding: 0 10px;
          margin: 10px auto;
        }
        .container {
          padding: 25px 30px;
        }
        .title {
          font-size: 22px;
        }
        .verification-text {
          font-size: 14px;
        }
        .verify-button {
          padding: 10px 25px;
          font-size: 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <!-- You can add your logo img here if you have one -->
        <h1>Victoria Tours</h1>
      </div>
      <h1 class="title">Account Approved!</h1>
      <p class="verification-text">
        Good news! Our team has reviewed and approved your account details. To complete your account setup and login, please verify your email address by clicking the button below.
      </p>
      <div class="button-container">
        <a href="${ConfirmationLink}" class="verify-button">Verify Email Address</a>
      </div>
      <div class="footer">
        <p>If you didn't create an account with Victoria Tours, you can safely ignore this email.</p>
        <p>© ${new Date().getFullYear()} Victoria Tours. All rights reserved.</p>
        <p>No. 29, Pham Van Bach Street, Yen Hoa Ward, Cau Giay District Vietnam</p>
      </div>
    </div>
  </body>
  </html>
    `,
  });
};
export const PasswordResetEmail = async (email: string, token: string) => {
  const ConfirmationLink = `${Domain}/auth/travel-agent/new-password?token=${token}`;

  await resend.emails.send({
    from: "Victoria Tours <noreply@victoriatour.vn>",
    to: email,
    subject: "Reset Your Password - Victoria Tours",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Victoria Tours</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
          margin: 20px auto;
          padding: 0 15px;
          background-color: #f3f4f6;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 35px 45px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
        }
        .logo {
          text-align: center;
          margin-bottom: 25px;
        }
        .logo h1 {
          color: #1e40af; /* Match brand color */
          font-weight: 700;
          font-size: 26px;
          margin: 0;
        }
        .title {
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: 600;
        }
        .reset-text { /* Renamed class for clarity */
          text-align: center;
          margin-bottom: 30px;
          color: #4b5563;
          font-size: 15px;
          line-height: 1.7;
        }
        .button-container {
          text-align: center;
          margin-bottom: 35px;
        }
        .reset-button { /* Renamed class for clarity */
          display: inline-block;
          background-color: #2563eb; /* Match brand button color */
          color: #ffffff !important;
          text-align: center;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: background-color 0.25s ease;
        }
        .reset-button:hover {
          background-color: #1d4ed8; /* Darker hover color */
        }
        .footer {
          text-align: center;
          margin-top: 35px;
          padding-top: 25px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .footer p {
          margin: 5px 0;
        }
        .link-text { /* Style for the fallback link */
          font-size: 12px;
          color: #6b7280;
          word-break: break-all; /* Prevent long links from breaking layout */
        }
        @media screen and (max-width: 600px) {
          body {
            padding: 0 10px;
            margin: 10px auto;
          }
          .container {
            padding: 25px 30px;
          }
          .title {
            font-size: 22px;
          }
          .reset-text {
            font-size: 14px;
          }
          .reset-button {
            padding: 10px 25px;
            font-size: 15px;
          }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
           <!-- Add logo if available -->
           <h1>Victoria Tours</h1>
        </div>
        <h1 class="title">Reset Your Password</h1>
        <p class="reset-text">
          You requested a password reset for your Victoria Tours account. Click the button below to set a new password. If you didn't request this, you can safely ignore this email.
        </p>
        <div class="button-container">
          <a href="${ConfirmationLink}" class="reset-button">Reset Password</a>
        </div>
        <div class="footer">
            <p>If you're having trouble clicking the button, copy and paste this link into your browser:</p>
            <p class="link-text">${ConfirmationLink}</p>
            <p>© ${new Date().getFullYear()} Victoria Tours. All rights reserved.</p>
            <p>No. 29, Pham Van Bach Street, Yen Hoa Ward, Cau Giay District Vietnam</p> <!-- Added address for consistency -->
        </div>
    </div>
</body>
</html>`,
  });
};
