import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moodType: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'stressed', 'anxious', 'calm', 'excited', 'tired'],
      required: true,
    },
    note: {
      type: String,
      maxlength: 300,
      default: '',
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user and date
moodSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Mood', moodSchema);
