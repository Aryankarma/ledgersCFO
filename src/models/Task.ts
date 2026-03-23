import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  client_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  due_date: Date;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    client_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    due_date: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
