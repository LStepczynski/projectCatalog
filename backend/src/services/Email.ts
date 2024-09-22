import nodemailer from 'nodemailer'

import dotenv from 'dotenv';
dotenv.config();

export class Email {
  private static EMAIL_PASSWORD = process.env.MAIL_PASSWORD
  private static EMAIL_ADDRESS = process.env.MAIL_ADDRESS
  
  public static sendEmail(recipient: string, subject: string, body: string): Boolean {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.EMAIL_ADDRESS,
        pass: this.EMAIL_PASSWORD
      }
    });
    
    // Email options
    const mailOptions = {
      from: `Course Catalog <${this.EMAIL_ADDRESS}>`, 
      to: recipient,
      subject: subject,
      text: body,
    };
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return false 
      }
      console.log('Email sent:', info.response);
      return true
    });
    return false
  } 

  public static sendAccountVerificationEmail(email: string, code: string) {
    return this.sendEmail(
      email, 
      "Account Verification", 
      `Please verify your Course Catalog account by clicking this link: ${process.env.FRONTEND_URL}/email-verification/${code}`
    )
  }
}