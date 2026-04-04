import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'I feel stressed 😫',
  'I am feeling anxious 😰',
  'I feel really sad today 😔',
  'I need motivation 💪',
  "I can't sleep 😴",
  'How do I manage anger? 😡',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-base shrink-0">🤖</div>
      <div className="chat-bubble-bot flex items-center gap-1.5 py-3 px-4">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function ChatMessage({ msg, isUser }) {
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-end gap-2 justify-end mb-4"
      >
        <div className="chat-bubble-user">
          <p className="text-sm leading-relaxed">{msg.content}</p>
          <p className="text-xs text-white/60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </motion.div>
    );
  }

  // Render markdown-like bold with **text**
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-end gap-2 mb-4"
    >
      <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-base shrink-0">🤖</div>
      <div className="chat-bubble-bot">
        <p className="text-sm leading-relaxed whitespace-pre-line">{renderContent(msg.content)}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message on mount
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! 🌿 I'm MindBot, your mental wellness companion.\n\nI'm here to listen, support, and help you navigate your emotions. Feel free to share what's on your mind — whether it's stress, anxiety, sadness, or anything else. You're in a safe space. 💙\n\nHow are you feeling today?`,
      timestamp: new Date(),
    }]);
    fetchSessions();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/chat/history');
      setSessions(data.sessions || []);
    } catch {}
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat/message', { message: msg, sessionId });
      if (!sessionId) setSessionId(data.sessionId);

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        type: data.type,
      }]);
    } catch {
      toast.error('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const loadSession = async (session) => {
    setSessionId(session.sessionId);
    setMessages(session.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
    setShowSessions(false);
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([{
      role: 'assistant',
      content: "Starting a new conversation 🌱 How are you feeling right now?",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-64px)] lg:max-h-screen">
      {/* Session sidebar */}
      <AnimatePresence>
        {showSessions && (
          <motion.div
            initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-900 border-r border-sage-100 dark:border-gray-800 overflow-hidden shrink-0"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Chat History</h3>
                <button onClick={newChat} className="text-xs text-sage-600 dark:text-sage-400 hover:underline">+ New</button>
              </div>
              <div className="space-y-2">
                {sessions.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No previous chats</p>}
                {sessions.map((s) => (
                  <button key={s.sessionId} onClick={() => loadSession(s)}
                    className={`w-full text-left p-3 rounded-xl text-xs border transition-all ${
                      s.sessionId === sessionId
                        ? 'bg-sage-50 dark:bg-gray-800 border-sage-200 dark:border-gray-700'
                        : 'border-transparent hover:bg-sage-50 dark:hover:bg-gray-800'
                    }`}>
                    <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {s.messages?.[0]?.content?.slice(0, 40) || 'Chat session'}...
                    </p>
                    <p className="text-gray-400 mt-0.5">{new Date(s.updatedAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-gray-900 border-b border-sage-100 dark:border-gray-800">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="p-1.5 rounded-lg hover:bg-sage-50 dark:hover:bg-gray-800 text-gray-500 lg:block"
            title="Chat history"
          >
            📋
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-xl">🤖</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">MindBot</p>
              <p className="text-xs text-green-500">Online • Ready to help</p>
            </div>
          </div>
          <button onClick={newChat} className="btn-outline text-xs py-1.5 px-3">New Chat</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-0">
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} isUser={msg.role === 'user'} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-sage-50 dark:bg-gray-800 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-gray-700 hover:bg-sage-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-5 py-4 bg-white dark:bg-gray-900 border-t border-sage-100 dark:border-gray-800">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Type how you're feeling… (Enter to send)"
              rows={1}
              className="input flex-1 resize-none min-h-[44px] max-h-32 py-2.5"
              style={{ height: 'auto' }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary h-11 w-11 p-0 flex items-center justify-center rounded-xl shrink-0 disabled:opacity-40"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="text-lg">↑</span>
              }
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">
            MindBot provides support but is not a substitute for professional mental health care.
          </p>
        </div>
      </div>
    </div>
  );
}
