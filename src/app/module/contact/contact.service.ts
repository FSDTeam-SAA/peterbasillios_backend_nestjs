import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import config from 'src/app/config';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import sendMailer from '../../helpers/sendMailer';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../notification/entities/notification.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact, ContactDocument } from './entities/contact.entity';

const escapeHtml = (value?: string) =>
  (value || 'Not provided')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async createContact(createContactDto: CreateContactDto) {
    const result = await this.contactModel.create(createContactDto);
    await this.notificationModel.create({
      title: 'New contact message',
      message: `${result.fullName} sent a contact message`,
      type: NotificationType.CONTACT,
      contact: result._id,
    });

    const contactEmail = config.email.to || config.email.admin || result.email;
    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const html = `
      <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px 28px;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;">New Contact Request</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;">${escapeHtml(result.fullName)} sent a message</h1>
            </div>

            <div style="padding:28px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
                A new client submitted the contact form. Their complete information is below.
              </p>

              <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#6b7280;width:150px;">Full Name</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">${escapeHtml(result.fullName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#6b7280;">Email</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">
                    <a href="mailto:${escapeHtml(result.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(result.email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#6b7280;">Phone Number</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">${escapeHtml(result.phoneNumber)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#6b7280;">Submitted At</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">${submittedAt}</td>
                </tr>
              </table>

              <div style="margin:0;padding:18px 20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#6b7280;">Message</p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#111827;white-space:pre-line;">${escapeHtml(result.message)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    await sendMailer(contactEmail, 'New Contact Form Submission', html, {
      replyTo: result.email,
    });

    return result;
  }

  async getAllContacts(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const searchAbleFields = ['fullName', 'email', 'phoneNumber', 'message'];

    const whenConditation = buildWhereConditions(params, searchAbleFields);

    const result = await this.contactModel
      .find(whenConditation)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await this.contactModel.countDocuments(whenConditation);

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getSingleContact(id: string) {
    const result = await this.contactModel.findById(id);
    if (!result) throw new HttpException('Contact is not found', 404);
    return result;
  }

  async updateContact(id: string, updateContactDto: UpdateContactDto) {
    const result = await this.contactModel.findByIdAndUpdate(
      id,
      updateContactDto,
      {
        new: true,
      },
    );
    return result;
  }

  async deleteContact(id: string) {
    const result = await this.contactModel.findByIdAndDelete(id);
    return result;
  }
}
