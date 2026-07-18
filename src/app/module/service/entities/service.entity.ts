import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop()
  name!: string;

  @Prop()
  description!: string;

  @Prop()
  image!: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
