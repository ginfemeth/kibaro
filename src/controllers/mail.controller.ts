// src/controllers/mail.controller.ts
import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {MailService} from '../services/mail.service';

export class MailController {
  constructor(
    @inject('services.MailService')
    private mailService: MailService,
  ) {}

  @post('/send-email')
  async sendEmail(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              to: {type: 'string'},
              subject: {type: 'string'},
              text: {type: 'string'},
              html: {type: 'string'},
            },
          },
        },
      },
    })
    emailRequest: {to: string; subject: string; text: string; html?: string},
  ): Promise<void> {
    const {to, subject, text, html} = emailRequest;
    await this.mailService.sendMail(to, subject, text, html);
  }
}