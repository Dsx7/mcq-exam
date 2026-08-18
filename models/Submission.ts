import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISubmission extends Document {
  examId: Types.ObjectId;
  studentName: string;
  studentRoll: string;
  answers: Map<string, number>; // questionId -> chosen option index
  submittedAt?: Date;
  score: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  timeTaken: number; // seconds
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentName: { type: String, required: true, trim: true },
    studentRoll: { type: String, required: true, trim: true },
    answers: { type: Map, of: Number, default: {} },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // seconds
    rank: { type: Number },
  },
  { timestamps: true }
);

// Unique per exam + roll
SubmissionSchema.index({ examId: 1, studentRoll: 1 }, { unique: true });

const Submission: Model<ISubmission> =
  mongoose.models.Submission ?? mongoose.model<ISubmission>('Submission', SubmissionSchema);
export default Submission;
