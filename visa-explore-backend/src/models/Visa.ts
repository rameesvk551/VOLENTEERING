import mongoose, { Document, Schema } from 'mongoose';

export type VisaType = 'visa-free' | 'voa' | 'evisa' | 'visa-required' | 'closed';

export interface IRequirement {
  title: string;
  description: string;
  mandatory: boolean;
}

export interface IFees {
  amount: number;
  currency: string;
}

export interface IProcessingTime {
  min: number;
  max: number;
  unit: 'days' | 'weeks' | 'months';
}

export interface IEmbassy {
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  phone: string;
  email: string;
  website: string;
  workingHours?: string;
}

export interface IVisa extends Document {
  originCountry: string;
  destinationCountry: string;
  visaType: VisaType;
  requirements: IRequirement[];
  stayDuration: number; // in days
  validityPeriod: number; // in days
  fees?: IFees;
  processingTime: IProcessingTime;
  complexityScore: number; // 0-100
  lastUpdated: Date;
  source: string;
  metadata: {
    embassy?: IEmbassy;
    notes?: string;
    restrictions?: string[];
    allowedPurposes?: string[]; // ['tourism', 'business', 'study', 'work', 'volunteer']
  };
}

const VisaSchema = new Schema<IVisa>(
  {
    originCountry: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 3,
      index: true,
    },
    destinationCountry: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 3,
      index: true,
    },
    visaType: {
      type: String,
      enum: ['visa-free', 'voa', 'evisa', 'visa-required', 'closed'],
      required: true,
    },
    requirements: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        mandatory: { type: Boolean, default: true },
      },
    ],
    stayDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    validityPeriod: {
      type: Number,
      required: true,
      min: 0,
    },
    fees: {
      amount: { type: Number, min: 0 },
      currency: { type: String, uppercase: true, default: 'USD' },
    },
    processingTime: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' },
    },
    complexityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      required: true,
      enum: ['IATA', 'GOV.UK', 'Sherpa', 'Manual', 'REST Countries'],
    },
    metadata: {
      embassy: {
        name: String,
        address: String,
        coordinates: {
          type: [Number],
          validate: {
            validator: function (v: number[]) {
              return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
            },
            message: 'Invalid coordinates format. Expected [longitude, latitude]',
          },
        },
        phone: String,
        email: String,
        website: String,
        workingHours: String,
      },
      notes: String,
      restrictions: [String],
      allowedPurposes: [
        {
          type: String,
          enum: ['tourism', 'business', 'study', 'work', 'volunteer', 'digital-nomad', 'medical'],
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient queries
VisaSchema.index({ originCountry: 1, destinationCountry: 1 }, { unique: true });
VisaSchema.index({ visaType: 1 });
VisaSchema.index({ complexityScore: 1 });
VisaSchema.index({ lastUpdated: -1 });

// Virtual for visa difficulty level
VisaSchema.virtual('difficultyLevel').get(function () {
  if (this.complexityScore <= 30) return 'easy';
  if (this.complexityScore <= 60) return 'moderate';
  return 'complex';
});

// Method to check if visa data is stale (older than 30 days)
VisaSchema.methods.isStale = function (): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.lastUpdated < thirtyDaysAgo;
};

// Static method to find visa by country pair
VisaSchema.statics.findByCountryPair = function (origin: string, destination: string) {
  return this.findOne({
    originCountry: origin.toUpperCase(),
    destinationCountry: destination.toUpperCase(),
  });
};

const Visa = mongoose.model<IVisa>('Visa', VisaSchema);

export default Visa;
