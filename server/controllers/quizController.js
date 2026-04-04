import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';

// ─── Quiz Questions Data ───────────────────────────────────────
const quizData = {
  anxiety: {
    title: 'Generalized Anxiety Disorder (GAD-7)',
    maxScore: 21,
    questions: [
      { id: 1, text: 'Feeling nervous, anxious, or on edge' },
      { id: 2, text: 'Not being able to stop or control worrying' },
      { id: 3, text: 'Worrying too much about different things' },
      { id: 4, text: 'Trouble relaxing' },
      { id: 5, text: 'Being so restless that it is hard to sit still' },
      { id: 6, text: 'Becoming easily annoyed or irritable' },
      { id: 7, text: 'Feeling afraid as if something awful might happen' },
    ],
    options: [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half the days', value: 2 },
      { label: 'Nearly every day', value: 3 },
    ],
    scoring: [
      { min: 0, max: 4, result: 'minimal', label: 'Minimal Anxiety', color: '#22c55e' },
      { min: 5, max: 9, result: 'low', label: 'Mild Anxiety', color: '#84cc16' },
      { min: 10, max: 14, result: 'moderate', label: 'Moderate Anxiety', color: '#f59e0b' },
      { min: 15, max: 21, result: 'severe', label: 'Severe Anxiety', color: '#ef4444' },
    ],
  },
  stress: {
    title: 'Perceived Stress Scale (PSS-10)',
    maxScore: 40,
    questions: [
      { id: 1, text: 'Been upset because of something unexpected' },
      { id: 2, text: 'Felt unable to control important things in your life' },
      { id: 3, text: 'Felt nervous and stressed' },
      { id: 4, text: 'Felt confident in your ability to handle problems', reverse: true },
      { id: 5, text: 'Felt things were going your way', reverse: true },
      { id: 6, text: 'Found you could not cope with all the things you had to do' },
      { id: 7, text: 'Been able to control irritations in your life', reverse: true },
      { id: 8, text: 'Felt on top of things', reverse: true },
      { id: 9, text: 'Been angered because of things outside your control' },
      { id: 10, text: 'Felt difficulties were piling up so high you could not overcome them' },
    ],
    options: [
      { label: 'Never', value: 0 },
      { label: 'Almost Never', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Fairly Often', value: 3 },
      { label: 'Very Often', value: 4 },
    ],
    scoring: [
      { min: 0, max: 13, result: 'low', label: 'Low Stress', color: '#22c55e' },
      { min: 14, max: 26, result: 'moderate', label: 'Moderate Stress', color: '#f59e0b' },
      { min: 27, max: 40, result: 'high', label: 'High Stress', color: '#ef4444' },
    ],
  },
  depression: {
    title: 'Patient Health Questionnaire (PHQ-9)',
    maxScore: 27,
    questions: [
      { id: 1, text: 'Little interest or pleasure in doing things' },
      { id: 2, text: 'Feeling down, depressed, or hopeless' },
      { id: 3, text: 'Trouble falling or staying asleep, or sleeping too much' },
      { id: 4, text: 'Feeling tired or having little energy' },
      { id: 5, text: 'Poor appetite or overeating' },
      { id: 6, text: 'Feeling bad about yourself — or that you are a failure' },
      { id: 7, text: 'Trouble concentrating on things' },
      { id: 8, text: 'Moving or speaking slowly, or being fidgety/restless' },
      { id: 9, text: 'Thoughts that you would be better off dead or hurting yourself' },
    ],
    options: [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half the days', value: 2 },
      { label: 'Nearly every day', value: 3 },
    ],
    scoring: [
      { min: 0, max: 4, result: 'minimal', label: 'Minimal Depression', color: '#22c55e' },
      { min: 5, max: 9, result: 'low', label: 'Mild Depression', color: '#84cc16' },
      { min: 10, max: 14, result: 'moderate', label: 'Moderate Depression', color: '#f59e0b' },
      { min: 15, max: 19, result: 'high', label: 'Moderately Severe', color: '#f97316' },
      { min: 20, max: 27, result: 'severe', label: 'Severe Depression', color: '#ef4444' },
    ],
  },
};

// Suggestions by quiz type and result
const suggestions = {
  anxiety: {
    minimal: ['Practice mindfulness for 5 minutes daily', 'Maintain a regular sleep schedule', 'Exercise regularly'],
    low: ['Try deep breathing exercises', 'Limit caffeine intake', 'Keep a worry journal', 'Practice progressive muscle relaxation'],
    moderate: ['Consider speaking with a counselor', 'Practice daily meditation', 'Limit news consumption', 'Build a strong support network'],
    severe: ['Please consult a mental health professional', 'Reach out to a trusted person', 'Consider therapy options', 'Crisis helpline: 988 (US)'],
  },
  stress: {
    low: ['Keep up the good work!', 'Maintain healthy boundaries', 'Regular exercise helps'],
    moderate: ['Practice time management', 'Take regular breaks', 'Try yoga or meditation', 'Limit multitasking'],
    high: ['Prioritize self-care', 'Delegate tasks where possible', 'Speak to a counselor', 'Identify and reduce stressors', 'Consider professional support'],
  },
  depression: {
    minimal: ['Maintain social connections', 'Stay physically active', 'Practice gratitude daily'],
    low: ['Set small daily goals', 'Get morning sunlight', 'Stay connected with friends', 'Establish a routine'],
    moderate: ['Speak to your doctor or therapist', 'Avoid isolation', 'Gentle exercise daily', 'Consider therapy'],
    high: ['Please seek professional help soon', 'Reach out to loved ones', 'Crisis line: 988', 'Consider medication evaluation'],
    severe: ['Urgent: Please contact a mental health professional', 'National crisis line: 988', 'Reach out to emergency services if needed'],
  },
};

// @route  GET /api/quizzes/questions/:type
export const getQuizQuestions = async (req, res) => {
  const { type } = req.params;
  if (!quizData[type]) return res.status(404).json({ message: 'Quiz type not found' });

  const { questions, options, title, maxScore } = quizData[type];
  res.json({ success: true, quiz: { type, title, questions, options, maxScore } });
};

// @route  POST /api/quizzes/submit
export const submitQuiz = async (req, res, next) => {
  try {
    const { quizType, answers } = req.body;

    if (!quizData[quizType]) return res.status(400).json({ message: 'Invalid quiz type' });

    const quiz = quizData[quizType];

    // Calculate score (handle reverse scoring for stress)
    let score = 0;
    const maxOptionValue = quiz.options[quiz.options.length - 1].value;

    quiz.questions.forEach((q, i) => {
      const answer = answers[i] || 0;
      if (q.reverse) {
        score += maxOptionValue - answer;
      } else {
        score += answer;
      }
    });

    // Find result level
    const resultLevel = quiz.scoring.find((s) => score >= s.min && score <= s.max);
    const result = resultLevel?.result || 'moderate';
    const resultSuggestions = suggestions[quizType][result] || [];

    // Save to database
    const quizResult = await QuizResult.create({
      userId: req.user._id,
      quizType,
      answers: answers.map((a, i) => ({ questionId: i + 1, answer: a })),
      score,
      maxScore: quiz.maxScore,
      result,
      suggestions: resultSuggestions,
    });

    // Update user quiz count
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalQuizzes: 1 } });

    res.status(201).json({
      success: true,
      quizResult: {
        ...quizResult.toObject(),
        resultLabel: resultLevel?.label,
        resultColor: resultLevel?.color,
        suggestions: resultSuggestions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/quizzes/history
export const getQuizHistory = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

export { quizData };
