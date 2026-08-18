import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ExamStatus = 'draft' | 'active' | 'ended';

export interface IExam extends Document {
  teacherId: Types.ObjectId;
  title: string;
  subject: string;
  slug: string;
  questions: Types.ObjectId[];
  duration: number; // minutes
  scheduledAt: Date;
  status: ExamStatus;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    duration: { type: Number, required: true, min: 1 }, // minutes
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'active', 'ended'], default: 'draft' },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const Exam: Model<IExam> = mongoose.models.Exam ?? mongoose.model<IExam>('Exam', ExamSchema);
export default Exam;
