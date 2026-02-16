'use client';

import React from 'react';
import { motion } from 'framer-motion';

function ScenarioSelection({ onSelect, completedDurations }) {
    const scenarios = [
        {
            duration: 15,
            title: "Clear in 15",
            subtitle: "Perfect for networking & first impressions",
            emoji: "⚡",
            locked: false,
            description: "Master precision: Who you are → What you do → Hook",
            focus: "Clarity training"
        },
        {
            duration: 30,
            title: "Impact in 30",
            subtitle: "Standard interview & meeting format",
            emoji: "🎯",
            locked: !completedDurations.includes(15),
            description: "Build authority: Hook → Value → Result",
            focus: "Structure + Impact"
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl font-black text-white mb-4">
                        Choose Your Challenge 🎤
                    </h2>
                    <p className="text-2xl text-red-200">
                        Master your self-introduction
                    </p>
                </motion.div>

                {/* Added items-stretch to grid to ensure rows are equal height */}
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
                    {scenarios.map((scenario, index) => (
                        <motion.div
                            key={scenario.duration}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            // Added h-full here so the wrapper fills the grid cell
                            className="relative h-full"
                        >
                            <motion.button
                                onClick={() => !scenario.locked && onSelect(scenario.duration)}
                                disabled={scenario.locked}
                                // Added h-full here so the button fills the wrapper
                                // Added flex & flex-col so content distributes evenly if needed
                                className={`w-full h-full p-10 rounded-3xl border-2 transition-all flex flex-col items-center justify-center ${scenario.locked
                                    ? 'bg-black/20 border-red-900/30 cursor-not-allowed opacity-50'
                                    : completedDurations.includes(scenario.duration)
                                        ? 'bg-green-900/30 border-green-500 hover:border-green-400'
                                        : 'bg-black/40 border-red-800/30 hover:border-red-500 hover:bg-red-900/20'
                                    }`}
                                whileHover={!scenario.locked ? { scale: 1.05 } : {}}
                                whileTap={!scenario.locked ? { scale: 0.95 } : {}}
                            >
                                {scenario.locked && (
                                    <div className="absolute top-4 right-4 text-4xl">🔒</div>
                                )}

                                {completedDurations.includes(scenario.duration) && (
                                    <div className="absolute top-4 right-4 text-4xl">✅</div>
                                )}

                                <div className="text-7xl mb-6">{scenario.emoji}</div>

                                <div className="text-6xl font-black text-white mb-3">
                                    {scenario.duration}s
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-3">
                                    {scenario.title}
                                </h3>

                                <p className="text-red-300 text-base mb-5">
                                    {scenario.subtitle}
                                </p>

                                <p className="text-red-200 text-base mb-4">
                                    {scenario.description}
                                </p>

                                <div className="inline-block px-4 py-2 bg-red-900/40 rounded-full text-red-300 text-sm font-semibold mt-auto">
                                    {scenario.focus}
                                </div>

                                {scenario.locked && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-5 text-red-400 text-base font-semibold"
                                    >
                                        Complete 15s to unlock
                                    </motion.div>
                                )}

                                {completedDurations.includes(scenario.duration) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-5 text-green-400 text-base font-semibold"
                                    >
                                        Try again to improve!
                                    </motion.div>
                                )}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-xl rounded-full px-8 py-4 border border-red-800/30">
                        <span className="text-red-300 font-semibold">Progress:</span>
                        <div className="flex gap-2">
                            {[15, 30].map((duration) => (
                                <div
                                    key={duration}
                                    className={`w-4 h-4 rounded-full ${completedDurations.includes(duration) ? 'bg-green-500' : 'bg-red-900/50'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-white font-bold">
                            {completedDurations.length}/2
                        </span>
                    </div>
                </motion.div>

                {/* Tip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 bg-red-900/20 border border-red-700/30 rounded-2xl p-6 text-center"
                >
                    <p className="text-red-200 text-lg">
                        💡 <strong>Start with 15 seconds</strong> — master the basics first!
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default ScenarioSelection;