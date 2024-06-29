// src/services/mail.service.ts
import {BindingScope, injectable} from '@loopback/core';
import nodemailer from 'nodemailer';

@injectable({scope: BindingScope.TRANSIENT})
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'ginfemeth@gmail.com',
        pass: 'jmlinformatique',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions = {
      from: 'your-email@example.com',
      to,
      subject,
      text,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}