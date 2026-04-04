import Chat from '../models/Chat.js';
import { v4 as uuidv4 } from 'uuid';
import Groq from "groq-sdk";
// ─── Rule-Based Response Engine ────────────────────────────────
const ruleBasedResponse = (message) => {
  const msg = message.toLowerCase();

  // Crisis detection - highest priority
  if (msg.includes('suicide') || msg.includes('kill myself') || msg.includes('end my life') || msg.includes('self harm')) {
    return {
      text: "I'm really concerned about what you've shared. Please know you're not alone. 💙\n\nPlease reach out immediately:\n• **Crisis Hotline**: Call or text **988** (US)\n• **Crisis Text Line**: Text HOME to 741741\n• **Emergency Services**: Call 911\n\nYou matter, and help is available right now.",
      type: 'crisis',
    };
  }

  // Stress responses
  if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('too much') || msg.includes('cant cope')) {
    const responses = [
      "I hear you — feeling stressed is really tough. 💛\n\nLet's try the **4-7-8 breathing** technique:\n• Breathe IN for 4 seconds\n• HOLD for 7 seconds\n• Breathe OUT for 8 seconds\n\nRepeat 3-4 times. This activates your calm response. You've got this! 🌿",
      "Stress can feel so heavy. Here's what helps:\n\n1. **Write it down** — list what's stressing you\n2. **Tackle one thing** at a time\n3. **Take a 10-min walk** outside\n4. **Talk to someone** you trust\n\nRemember: you've overcome challenges before. 💪",
    ];
    return { text: responses[Math.floor(Math.random() * responses.length)], type: 'stress' };
  }

  // Anxiety responses
  if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('worry') || msg.includes('panic') || msg.includes('scared')) {
    return {
      text: "Anxiety can feel really overwhelming. Let's ground you right now. 🌱\n\n**Try the 5-4-3-2-1 grounding technique:**\n• 5 things you can **SEE** 👀\n• 4 things you can **TOUCH** 🤲\n• 3 things you can **HEAR** 👂\n• 2 things you can **SMELL** 👃\n• 1 thing you can **TASTE** 👅\n\nThis brings you back to the present. You're safe. 💙",
      type: 'anxiety',
    };
  }

  // Sadness/depression responses
  if (msg.includes('sad') || msg.includes('depress') || msg.includes('unhappy') || msg.includes('hopeless') || msg.includes('empty') || msg.includes('lonely')) {
    const responses = [
      "I'm really sorry you're feeling this way. Your feelings are valid. 💙\n\nWhen sadness feels heavy, small steps matter:\n• **Step outside** for fresh air 🌤️\n• **Call someone** who lifts you up 📞\n• Do **one kind thing** for yourself today\n• Write **3 things** you're grateful for 📝\n\nYou don't have to feel better all at once. Be gentle with yourself. 🌸",
      "Feeling sad doesn't mean you're broken — it means you're human. 💛\n\nSome things that genuinely help:\n• Let yourself **feel it** without judgment\n• **Move your body** even for 5 minutes\n• Watch or listen to something **comforting**\n• Consider **talking to a therapist** — it's a sign of strength, not weakness\n\nI'm here with you. 🤗",
    ];
    return { text: responses[Math.floor(Math.random() * responses.length)], type: 'sadness' };
  }

  // Anger responses
  if (msg.includes('angry') || msg.includes('anger') || msg.includes('furious') || msg.includes('mad') || msg.includes('rage')) {
    return {
      text: "It's completely okay to feel angry — it's a natural emotion. 🔥\n\n**Cool-down strategies that work:**\n• **Count to 10** before responding\n• **Breathe deeply** — 5 slow breaths\n• **Step away** from the situation temporarily\n• **Jog or exercise** to release tension\n• Write in a **journal** what you feel\n\nOnce calmer, revisit what triggered you. Anger often signals something important. 💭",
      type: 'anger',
    };
  }

  // Tired/exhaustion
  if (msg.includes('tired') || msg.includes('exhaust') || msg.includes('fatigue') || msg.includes('burnout') || msg.includes('drained')) {
    return {
      text: "Exhaustion is your body's signal to rest — and that's okay. 😴\n\n**Rest & recharge tips:**\n• **Nap for 20 minutes** — any longer can make you groggier\n• Set **screen-free time** before bed\n• Try a **gentle stretch** or walk\n• Say **no** to one non-essential thing today\n• Hydrate — even mild dehydration causes fatigue 💧\n\nYou can't pour from an empty cup. Take care of yourself first. 🌿",
      type: 'tired',
    };
  }

  // Positive moods
  if (msg.includes('happy') || msg.includes('great') || msg.includes('amazing') || msg.includes('wonderful') || msg.includes('good') || msg.includes('excited')) {
    return {
      text: "That's wonderful to hear! 🌟 Your positive energy is beautiful!\n\n**Ways to amplify the good feeling:**\n• Write down **what made today great**\n• **Share your joy** with someone you love\n• Do something **kind for others**\n• **Savor this moment** — happiness compounds!\n\nYou deserve every bit of joy you feel today! 🎉💛",
      type: 'positive',
    };
  }

  // Help request
  if (msg.includes('help') || msg.includes('support') || msg.includes('advice') || msg.includes('what should i')) {
    return {
      text: "I'm here to support you! 🤝 Here are some ways I can help:\n\n• 🧘 **Breathing & grounding** exercises\n• 💭 **Talking through** your feelings\n• 📊 **Coping strategies** for anxiety/stress/sadness\n• 🌱 **Daily wellness tips**\n• 📋 **Quiz recommendations** for self-assessment\n\nTell me what you're experiencing, and we'll figure it out together. What's on your mind? 💙",
      type: 'help',
    };
  }

  // Default thoughtful response
  const defaults = [
    "Thank you for sharing that with me. 💙 I'm here to listen.\n\nCould you tell me a bit more about how you're feeling? Sometimes putting it into words helps us understand our emotions better. What's been on your mind lately?",
    "I hear you. 🌿 Your feelings matter, and you deserve support.\n\nWould you like to:\n• 🧘 Try a quick relaxation exercise?\n• 💬 Talk more about what you're experiencing?\n• 📝 Take a mental health quiz to get insights?\n\nI'm here for you, whatever you need.",
    "It takes courage to reach out — I'm glad you did! 🌸\n\nI'm MindBot, your mental wellness companion. Share what's on your heart, and I'll do my best to offer support, coping strategies, and a listening ear. 💛\n\nWhat would you like to talk about today?",
  ];

  return { text: defaults[Math.floor(Math.random() * defaults.length)], type: 'default' };
};

// @route  POST /api/chat/message
export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sid = sessionId || uuidv4();

    // Get AI response (rule-based, with OpenAI option)
    const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let botResponse;

if (process.env.GROQ_API_KEY) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast & good model
      messages: [
        {
          role: "system",
          content: `You are MindBot, a compassionate mental health support chatbot. 
Respond with empathy, provide coping strategies, and offer gentle guidance. 
Always recommend professional help for serious concerns. 
Keep responses concise (under 200 words), warm, and supportive. 
Use emoji sparingly but warmly. Never diagnose.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    botResponse = {
      text:
        completion.choices[0]?.message?.content ||
        ruleBasedResponse(message).text,
      type: "ai",
    };
  } catch (error) {
    console.error("Groq Error:", error);
    botResponse = ruleBasedResponse(message); // fallback
  }
} else {
  botResponse = ruleBasedResponse(message);
}

    // Save to database
    let chatSession = await Chat.findOne({ userId: req.user._id, sessionId: sid });

    if (!chatSession) {
      chatSession = new Chat({ userId: req.user._id, sessionId: sid, messages: [] });
    }

    chatSession.messages.push({ role: 'user', content: message });
    chatSession.messages.push({ role: 'assistant', content: botResponse.text });
    await chatSession.save();

    res.json({
      success: true,
      sessionId: sid,
      response: botResponse.text,
      type: botResponse.type,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/chat/history
export const getChatHistory = async (req, res, next) => {
  try {
    const sessions = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('sessionId messages createdAt updatedAt');

    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/chat/session/:sessionId
export const getSession = async (req, res, next) => {
  try {
    const session = await Chat.findOne({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};
