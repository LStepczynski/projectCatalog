import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

import { InternalError } from '@utils/statusError';
dotenv.config();

export class Email {
  private static SES_REGION = process.env.SES_REGION;

  /**
   * Sends an email to the specified recipient.
   *
   * @param {string} recipient - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The text content of the email.
   * @returns {Promise<void>}
   *
   * @example
   * const success = await Email.sendEmail('test@example.com', 'Subject', 'Body content');
   */
  public static async sendEmail(
    recipient: string,
    subject: string,
    body: string
  ): Promise<void> {
    // Configure AWS SDK
    const ses = new SESClient({ region: this.SES_REGION });

    // Create SES transporter
    const transporter = nodemailer.createTransport({
      SES: { ses, aws: { SendRawEmailCommand } },
    });

    // Email options
    const mailOptions = {
      from: `Project Catalog <no-reply@projectcatalog.click>`,
      to: recipient,
      subject: subject,
      text: body,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      throw new InternalError('Error while sending an email', 500, [
        'sendMail',
      ]);
    }
  }

  /**
   * Sends an account verification email to a new user.
   *
   * @TODO: Update the email to include the verification resend link
   *
   * @param {string} email - The recipient's email address.
   * @param {string} username - The username of the recipient.
   * @param {string} code - The verification code used to validate the account.
   * @returns {Promise<void>} Returns `true` if the email is sent successfully, `false` otherwise.
   *
   * @example
   * const success = await Email.sendAccountVerificationEmail('user@example.com', 'username', 'verificationCode123');
   */
  public static async sendAccountVerificationEmail(
    email: string,
    username: string,
    code: string
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Account Verification',
      `Hello ${username}.\nPlease verify your Project Catalog account by clicking this link: ${process.env.FRONTEND_URL}/email-verification/${code}`
    );
  }

  /**
   * Sends a password reset email with a reset link.
   *
   * @param {string} email - The recipient's email address.
   * @param {string} username - The username of the recipient.
   * @param {string} code - The password reset token.
   * @returns {Promise<void>} Returns `true` if the email is sent successfully, `false` otherwise.
   *
   * @example
   * const success = await Email.sendPasswordResetEmail('user@example.com', 'username', 'resetToken123');
   */
  public static async sendPasswordResetEmail(
    email: string,
    username: string,
    code: string
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Password Reset Request',
      `Hello ${username},\n\nYou can reset your password by clicking this link: ${process.env.FRONTEND_URL}/password-reset/${code}\n\nThis link will expire in 3 hours.\n\nIf you did not request a password reset, please ignore this email.`
    );
  }

  /**
   * Sends an email containing a newly generated password.
   *
   * @param {string} email - The recipient's email address.
   * @param {string} username - The username of the recipient.
   * @param {string} newPassword - The new password for the user.
   * @returns {Promise<void>} Returns `true` if the email is sent successfully, `false` otherwise.
   *
   * @example
   * const success = await Email.sendNewPasswordEmail('user@example.com', 'username', 'NewPassword123');
   */
  public static async sendNewPasswordEmail(
    email: string,
    username: string,
    newPassword: string
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Your New Password',
      `Hello ${username},\n\nYour password has been reset. Your new password is: ${newPassword}\n\nPlease log in and change your password immediately to ensure your account's security.\n\nIf you did not request a password reset, please contact our support team immediately.`
    );
  }

  /**
   * Sends an email verification link for a new email address.
   *
   * @param {string} newEmail - The recipient's new email address.
   * @param {string} username - The username of the recipient.
   * @param {string} verificationTokenValue - The token to verify the email change.
   * @returns {Promise<void>} Returns `true` if the email is sent successfully, `false` otherwise.
   *
   * @example
   * const success = await Email.sendEmailChangeVerificationEmail('newuser@example.com', 'username', 'token123');
   */
  public static async sendEmailChangeVerificationEmail(
    newEmail: string,
    username: string,
    verificationTokenValue: string
  ): Promise<void> {
    await this.sendEmail(
      newEmail,
      'Verify Your New Email Address',
      `Hello ${username},\n\nYou have requested to change your email address. Please verify your new email by clicking this link: ${process.env.FRONTEND_URL}/verify-email-change/${verificationTokenValue}\n\nThis link will expire in 6 hours.\n\nIf you did not request this change, please contact our support team immediately.`
    );
  }
}
