import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const QUIZ_META = {
  anxiety:    { emoji: '😰', label: 'Anxiety Test',      desc: 'GAD-7 standardized scale', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  stress:     { emoji: '😫', label: 'Stress Test',       desc: 'Perceived Stress Scale (PSS-10)', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  depression: { emoji: '😔', label: 'Depression Scale',  desc: 'PHQ-9 clinical questionnaire', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
};

const RESULT_STYLES = {
  minimal: { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: '✅' },
  low:     { color: 'text-lime-600',  bg: 'bg-lime-50 dark:bg-lime-900/20',   border: 'border-lime-200 dark:border-lime-800',   icon: '🟡' },
  moderate:{ color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: '⚠️' },
  high:    { color: 'text-orange-600',bg: 'bg-orange-50 dark:bg-orange-900/20',border: 'border-orange-200 dark:border-orange-800',icon: '🔶' },
  severe:  { color: 'text-red-600',   bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800',     icon: '🔴' },
};

// ─── Quiz Selector ────────────────────────────────────────────
function QuizSelector({ onSelect }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/quizzes/history').then(({ data }) => setHistory(data.results || [])).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Mental Health Quizzes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Evidence-based assessments to help you understand your mental wellness</p>
      </div>

      <div className="grid gap-4 mb-10">
        {Object.entries(QUIZ_META).map(([type, meta]) => (
          <motion.button
            key={type}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelect(type)}
            className={`card p-5 text-left border-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${meta.color}`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{meta.emoji}</span>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">{meta.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{meta.desc}</p>
              </div>
              <span className={`badge ${meta.badge} px-3 py-1`}>Start →</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Past Results</h2>
          <div className="space-y-2">
            {history.slice(0, 6).map((r, i) => {
              const style = RESULT_STYLES[r.result] || RESULT_STYLES.moderate;
              const meta = QUIZ_META[r.quizType];
              return (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <span className="text-xl">{meta?.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm capitalize text-gray-800 dark:text-gray-200">{r.quizType} Test</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.score}/{r.maxScore}</p>
                    <span className={`text-xs font-medium capitalize ${style.color}`}>{r.result}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active Quiz ──────────────────────────────────────────────
function ActiveQuiz({ type, onComplete, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/questions/${type}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(null));
      })
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [type]);

  const handleAnswer = (value) => {
    const updated = [...answers];
    updated[current] = value;
    setAnswers(updated);
    if (current < quiz.questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) return toast.error('Please answer all questions');
    setSubmitting(true);
    try {
      const { data } = await api.post('/quizzes/submit', { quizType: type, answers });
      onComplete(data.quizResult);
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-6 max-w-2xl mx-auto flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Loading quiz...</p>
      </div>
    </div>
  );
  if (!quiz) return null;

  const progress = ((current + 1) / quiz.questions.length) * 100;
  const meta = QUIZ_META[type];
  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-gray-800 text-gray-500">←</button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-gray-900 dark:text-white">{meta.emoji} {quiz.title}</h1>
          <p className="text-sm text-gray-400">Question {current + 1} of {quiz.questions.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-sage-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-sage-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Question dots */}
      <div className="flex gap-1.5 justify-center mb-8 flex-wrap">
        {quiz.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
              i === current ? 'bg-sage-600 text-white scale-110' :
              answers[i] !== null ? 'bg-sage-200 dark:bg-sage-700 text-sage-700 dark:text-sage-300' :
              'bg-sage-50 dark:bg-gray-800 text-gray-400'
            }`}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="card p-6 mb-6"
        >
          <p className="text-xs font-medium text-sage-500 dark:text-sage-400 uppercase tracking-wider mb-3">
            Over the last 2 weeks, how often have you been bothered by:
          </p>
          <p className="font-display text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
            {quiz.questions[current].text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {quiz.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 ${
              answers[current] === opt.value
                ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20 dark:border-sage-500'
                : 'border-sage-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-sage-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                answers[current] === opt.value ? 'border-sage-500 bg-sage-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {answers[current] === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="btn-outline disabled:opacity-30"
        >
          ← Previous
        </button>

        {current < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            disabled={answers[current] === null}
            className="btn-primary disabled:opacity-40"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="btn-primary disabled:opacity-40 flex items-center gap-2"
          >
            {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : '📊 See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Quiz Result ──────────────────────────────────────────────
function QuizResult({ result, type, onRetake, onBack }) {
  const style = RESULT_STYLES[result.result] || RESULT_STYLES.moderate;
  const meta = QUIZ_META[type];
  const pct = Math.round((result.score / result.maxScore) * 100);

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-8">
        <span className="text-6xl block mb-4">{style.icon}</span>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Results</h1>
        <p className="text-gray-500 dark:text-gray-400">{meta.label} · {new Date().toLocaleDateString('en', { month: 'long', day: 'numeric' })}</p>
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
        className={`card p-6 border-2 mb-6 text-center ${style.bg} ${style.border}`}
      >
        <p className="text-5xl font-bold font-display text-gray-900 dark:text-white mb-1">{result.score}<span className="text-xl text-gray-400">/{result.maxScore}</span></p>
        <div className="w-full h-3 bg-white/50 dark:bg-gray-700 rounded-full my-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: style.color.replace('text-', '') }}
          />
        </div>
        <p className={`text-xl font-bold capitalize ${style.color}`}>{result.result} Level</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Score: {pct}%</p>
      </motion.div>

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="card p-5 mb-6"
        >
          <h3 className="font-display font-semibold text-gray-800 dark:text-gray-200 mb-3">💡 Recommendations</h3>
          <ul className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-sage-500 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 mb-6">
        ⚠️ This quiz is for informational purposes only and is not a clinical diagnosis. Please consult a qualified mental health professional for proper assessment and treatment.
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1">← Take Another</button>
        <button onClick={onRetake} className="btn-primary flex-1">🔄 Retake</button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export default function QuizPage() {
  const { type: urlType } = useParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(urlType || null);
  const [result, setResult] = useState(null);

  useEffect(() => { if (urlType) setSelectedType(urlType); }, [urlType]);

  if (result) return <QuizResult result={result} type={selectedType} onRetake={() => { setResult(null); }} onBack={() => { setResult(null); setSelectedType(null); navigate('/quiz'); }} />;
  if (selectedType) return <ActiveQuiz type={selectedType} onComplete={setResult} onBack={() => { setSelectedType(null); navigate('/quiz'); }} />;
  return <QuizSelector onSelect={(t) => { setSelectedType(t); navigate(`/quiz/${t}`); }} />;
}
