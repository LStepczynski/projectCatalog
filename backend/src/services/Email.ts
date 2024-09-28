import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();

export class Email {
  private static EMAIL_PASSWORD = process.env.MAIL_PASSWORD;
  private static EMAIL_ADDRESS = process.env.MAIL_ADDRESS;

  public static sendEmail(
    recipient: string,
    subject: string,
    body: string
  ): boolean {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.EMAIL_ADDRESS,
        pass: this.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `Project Catalog <${this.EMAIL_ADDRESS}>`,
      to: recipient,
      subject: subject,
      text: body,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return false;
      }
      console.log('Email sent:', info.response);
      return true;
    });
    return false;
  }

  public static sendAccountVerificationEmail(
    email: string,
    username: string,
    code: string
  ) {
    return this.sendEmail(
      email,
      'Account Verification',
      `Hello ${username}.\nPlease verify your Project Catalog account by clicking this link: ${process.env.FRONTEND_URL}/email-verification/${code}`
    );
  }

  public static sendPasswordResetEmail(
    email: string,
    username: string,
    code: string
  ): boolean {
    return this.sendEmail(
      email,
      'Password Reset Request',
      `Hello ${username},\n\nYou can reset your password by clicking this link: ${process.env.FRONTEND_URL}/password-reset/${code}\n\nThis link will expire in 6 hours.\n\nIf you did not request a password reset, please ignore this email.`
    );
  }

  public static sendNewPasswordEmail(
    email: string,
    username: string,
    newPassword: string
  ): boolean {
    return this.sendEmail(
      email,
      'Your New Password',
      `Hello ${username},\n\nYour password has been reset. Your new password is: ${newPassword}\n\nPlease log in and change your password immediately to ensure your account's security.\n\nIf you did not request a password reset, please contact our support team immediately.`
    );
  }

  public static sendEmailChangeVerificationEmail(
    newEmail: string,
    username: string,
    verificationTokenValue: string
  ): boolean {
    return this.sendEmail(
      newEmail,
      'Verify Your New Email Address',
      `Hello ${username},\n\nYou have requested to change your email address. Please verify your new email by clicking this link: ${process.env.FRONTEND_URL}/verify-email-change/${verificationTokenValue}\n\nThis link will expire in 6 hours.\n\nIf you did not request this change, please contact our support team immediately.`
    );
  }
}
