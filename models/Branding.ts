import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBranding extends Document {
  ownerId: Types.ObjectId; // teacher or admin
  ownerRole: 'admin' | 'teacher';
  instituteName: string;
  logoUrl?: string;
  headerText?: string;
  footerText?: string;
  updatedAt: Date;
}

const BrandingSchema = new Schema<IBranding>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    ownerRole: { type: String, enum: ['admin', 'teacher'], required: true },
    instituteName: { type: String, default: '', trim: true },
    logoUrl: { type: String },
    headerText: { type: String, default: '', trim: true },
    footerText: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const Branding: Model<IBranding> =
  mongoose.models.Branding ?? mongoose.model<IBranding>('Branding', BrandingSchema);
export default Branding;
