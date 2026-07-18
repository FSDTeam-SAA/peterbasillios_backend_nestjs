import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Contact } from '../../contact/entities/contact.entity';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  CONTACT = 'contact',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ enum: NotificationType, required: true })
  type!: NotificationType;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Contact.name })
  contact!: mongoose.Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
