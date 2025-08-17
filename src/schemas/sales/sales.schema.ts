import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sellerId: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'completed' | 'cancelled';
}

export const SaleSchema = SchemaFactory.createForClass(Sale);