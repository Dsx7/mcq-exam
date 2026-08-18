import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuestion extends Document {
  teacherId: Types.ObjectId;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number; // 0-3 index
  explanation?: string;
  marks: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length === 4, 'Must have exactly 4 options'],
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, trim: true },
    marks: { type: Number, required: true, default: 1, min: 1 },
  },
  { timestamps: true }
);

const Question: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema);
export default Question;
