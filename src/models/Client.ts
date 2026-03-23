import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  company_name: string;
  country: string;
  entity_type: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    company_name: { type: String, required: true },
    country: { type: String, required: true },
    entity_type: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
