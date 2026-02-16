'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
    {
        id: 1,
        question: "When speaking in public, you usually...",
        options: [
            { text: "Plan every word carefully", value: "planner", emoji: "📝" },
            { text: "Go with the flow", value: "spontaneous", emoji: "🌊" },
            { text: "Feel nervous but push through", value: "brave", emoji: "💪" },
            { text: "Thrive on the energy", value: "energetic", emoji: "⚡" }
        ]
    },
    {
        id: 2,
        question: "Pick a word that describes you best:",
        options: [
            { text: "Analytical", value: "analytical", emoji: "🧠" },
            { text: "Creative", value: "creative", emoji: "🎨" },
            { text: "Empathetic", value: "empathetic", emoji: "❤️" },
            { text: "Ambitious", value: "ambitious", emoji: "🎯" }
        ]
    },
    {
        id: 3,
        question: "Your biggest struggle when explaining yourself:",
        options: [
            { text: "Organizing my thoughts", value: "organization", emoji: "🧩" },
            { text: "Finding the right words", value: "vocabulary", emoji: "💬" },
            { text: "Managing anxiety", value: "anxiety", emoji: "😰" },
            { text: "Being concise", value: "brevity", emoji: "⏱️" }
        ]
    },
    {
        id: 4,
        question: "In conversations, you tend to:",
        options: [
            { text: "Listen more than speak", value: "listener", emoji: "👂" },
            { text: "Lead the discussion", value: "leader", emoji: "🗣️" },
            { text: "Ask lots of questions", value: "curious", emoji: "❓" },
            { text: "Share stories and examples", value: "storyteller", emoji: "📖" }
        ]
    },
    {
        id: 5,
        question: "When you meet someone new, you:",
        options: [
            { text: "Wait for them to start talking", value: "reserved", emoji: "🤫" },
            { text: "Introduce myself confidently", value: "confident", emoji: "🤝" },
            { text: "Feel excited to connect", value: "social", emoji: "😊" },
            { text: "Assess the situation first", value: "observer", emoji: "👀" }
        ]
    }
];

const PERSONALITY_TYPES = {
    "planner-analytical": {
        title: "Strategic Architect",
        emoji: "🏗️",
        description: "You're methodical and precise — but you may overthink under pressure. Your strength is preparation; your challenge is spontaneity."
    },
    "planner-creative": {
        title: "Visionary Planner",
        emoji: "🎨📋",
        description: "You blend creativity with structure. You craft beautiful presentations but sometimes get lost in details."
    },
    "spontaneous-creative": {
        title: "Free Spirit",
        emoji: "🦋",
        description: "You're naturally expressive and think on your feet — but structure will help you shine even brighter."
    },
    "brave-analytical": {
        title: "Thoughtful Builder",
        emoji: "🧠⚒️",
        description: "You're smart and push through fear — but you overthink under pressure. Let's build your confidence."
    },
    "energetic-ambitious": {
        title: "Dynamic Leader",
        emoji: "⚡🎯",
        description: "You thrive on energy and goals. Your passion is clear — let's channel it with precision."
    },
    "listener-empathetic": {
        title: "Compassionate Connector",
        emoji: "❤️👂",
        description: "You understand people deeply. Your challenge is expressing your own voice as clearly as you hear others."
    },
    "default": {
        title: "Unique Communicator",
        emoji: "✨",
        description: "You have a unique communication style. Let's discover your strengths and refine your approach."
    }
};

function WarmupTest({ onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [personalityType, setPersonalityType] = useState(null);

    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

    const handleAnswer = (value) => {
        const newAnswers = {
            ...answers,
            [QUESTIONS[currentQuestion].id]: value
        };
        setAnswers(newAnswers);

        if (currentQuestion < QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentQuestion(currentQuestion + 1);
            }, 300);
        } else {
            // Calculate personality type
            setTimeout(() => {
                const result = calculatePersonalityType(newAnswers);
                setPersonalityType(result);
                setShowResult(true);
            }, 500);
        }
    };

    const calculatePersonalityType = (answers) => {
        const answerValues = Object.values(answers);

        // Simple logic to determine personality type based on first two answers
        const key = `${answerValues[0]}-${answerValues[1]}`;

        return PERSONALITY_TYPES[key] || PERSONALITY_TYPES.default;
    };

    const handleContinue = () => {
        onComplete({
            answers,
            personalityType
        });
    };

    if (showResult && personalityType) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full bg-black/40 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-red-800/30 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            delay: 0.2
                        }}
                        className="text-8xl mb-6"
                    >
                        {personalityType.emoji}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-5xl font-black text-white mb-4"
                    >
                        Your Communication Style:
                    </motion.h2>

                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-4xl font-bold text-red-400 mb-6"
                    >
                        {personalityType.title}
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-xl text-red-100 mb-10 leading-relaxed"
                    >
                        {personalityType.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="bg-red-900/30 rounded-2xl p-6 mb-8"
                    >
                        <p className="text-red-200 text-lg">
                            ✨ <strong>This primes you emotionally.</strong> Now let's see how you actually speak under pressure.
                        </p>
                    </motion.div>

                    <motion.button
                        onClick={handleContinue}
                        className="px-12 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-full shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        Ready for the Real Challenge 🔥
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    const question = QUESTIONS[currentQuestion];

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-3xl w-full">
                {/* Progress Bar */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-red-300 font-semibold">
                            Question {currentQuestion + 1} of {QUESTIONS.length}
                        </span>
                        <span className="text-red-300 font-semibold">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </motion.div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-800/30"
                    >
                        <h3 className="text-3xl font-bold text-white mb-8 text-center">
                            {question.question}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option, index) => (
                                <motion.button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    className="p-6 bg-white/5 border-2 border-red-800/30 rounded-2xl text-left hover:border-red-500 hover:bg-red-900/20 transition-all group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">{option.emoji}</span>
                                        <span className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">
                                            {option.text}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Motivational Text */}
                <motion.p
                    className="text-center text-red-300/70 mt-8 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    💪 You're warming up your communication muscle...
                </motion.p>
            </div>
        </div>
    );
}

export default WarmupTest;