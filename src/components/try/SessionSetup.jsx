'use client';

import React from 'react';
import { motion } from 'framer-motion';

function SessionSetup({ duration, onStart }) {
    const getDurationInfo = () => {
        switch (duration) {
            case 10:
                return {
                    title: '10-Second Communication Challenge',
                    description: 'Master the hook. Be remembered.',
                    focus: 'First impression and intrigue'
                };
            case 30:
                return {
                    title: '30-Second Communication Challenge',
                    description: 'Build clarity. Be understood.',
                    focus: 'Who you help, what you solve, why you care'
                };
            case 60:
                return {
                    title: '60-Second Communication Challenge',
                    description: 'Establish trust. Be followed.',
                    focus: 'Story, credibility, and authority'
                };
            default:
                return {
                    title: 'Communication Challenge',
                    description: 'Practice your introduction',
                    focus: 'Communication skills'
                };
        }
    };

    const info = getDurationInfo();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-black/40 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-red-800/30 text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-8xl mb-6"
                >
                    🎤
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl font-black text-white mb-4"
                >
                    {info.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl text-red-300 mb-12"
                >
                    {info.description}
                </motion.p>

                {/* Key Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-red-900/20 border-2 border-red-700/40 rounded-2xl p-8 mb-12"
                >
                    <p className="text-xl text-white mb-6 font-semibold">
                        This is not a test.<br />
                        It's practice.
                    </p>

                    <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 text-xl">✔</span>
                            <span className="text-white text-lg">Real feedback</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 text-xl">✔</span>
                            <span className="text-white text-lg">Clear improvement goals</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 text-xl">✔</span>
                            <span className="text-white text-lg">A chance to level up</span>
                        </div>
                    </div>
                </motion.div>

                {/* Focus Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-black/30 rounded-xl p-4 mb-8"
                >
                    <p className="text-red-200 text-sm mb-1">Focus:</p>
                    <p className="text-white font-semibold">{info.focus}</p>
                </motion.div>

                {/* Start Button */}
                <motion.button
                    onClick={onStart}
                    className="w-full py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    Start Attempt 1 🚀
                </motion.button>

                {/* Info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-red-300/60 text-sm"
                >
                    You'll have up to 3 attempts to refine your message
                </motion.p>
            </motion.div>
        </div>
    );
}

export default SessionSetup;