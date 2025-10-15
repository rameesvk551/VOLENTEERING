import mongoose, { Document, Schema } from 'mongoose';

export interface ICountry extends Document {
  code: string; // ISO Alpha-3 (e.g., 'IND', 'USA')
  code2: string; // ISO Alpha-2 (e.g., 'IN', 'US')
  name: string;
  officialName: string;
  flag: string; // Emoji or URL
  region: string;
  subregion: string;
  coordinates: [number, number]; // [longitude, latitude]
  population: number;
  languages: string[];
  currencies: string[];
  capital: string[];
  timezones: string[];
  visaFreedomIndex?: number; // Global ranking
  visaFreedomScore?: number; // Score out of 100
  lastUpdated: Date;
}

const CountrySchema = new Schema<ICountry>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      index: true,
    },
    code2: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    officialName: {
      type: String,
      required: true,
      trim: true,
    },
    flag: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
      enum: ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'],
    },
    subregion: {
      type: String,
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v: number[]) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates format. Expected [longitude, latitude]',
      },
    },
    population: {
      type: Number,
      required: true,
      min: 0,
    },
    languages: {
      type: [String],
      required: true,
    },
    currencies: {
      type: [String],
      required: true,
    },
    capital: {
      type: [String],
      required: true,
    },
    timezones: {
      type: [String],
      required: true,
    },
    visaFreedomIndex: {
      type: Number,
      min: 1,
    },
    visaFreedomScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Additional indexes
CountrySchema.index({ name: 'text' });
CountrySchema.index({ region: 1, subregion: 1 });
CountrySchema.index({ visaFreedomIndex: 1 });

// Virtual for formatted population
CountrySchema.virtual('formattedPopulation').get(function () {
  return new Intl.NumberFormat('en-US').format(this.population);
});

// Method to check if country data is stale (older than 90 days)
CountrySchema.methods.isStale = function (): boolean {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  return this.lastUpdated < ninetyDaysAgo;
};

const Country = mongoose.model<ICountry>('Country', CountrySchema);

export default Country;
