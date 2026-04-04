import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizType: {
      type: String,
      enum: ['anxiety', 'stress', 'depression'],
      required: true,
    },
    answers: [
      {
        questionId: Number,
        answer: Number, // 0-3 or 0-4 scale
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    result: {
      type: String,
      enum: ['minimal', 'low', 'moderate', 'high', 'severe'],
      required: true,
    },
    suggestions: [String],
  },
  { timestamps: true }
);

quizResultSchema.index({ userId: 1, quizType: 1, createdAt: -1 });

export default mongoose.model('QuizResult', quizResultSchema);
