'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

function FinalReport({ allAttempts, finalResult, duration, userData, onTryAnother }) {
    const [showScores, setShowScores] = useState(false);

    const getDurationSpecificContent = () => {
        switch (duration) {
            case 10:
                return {
                    unlockTitle: 'What This Unlocks',
                    unlocks: [
                        'Stronger first impressions',
                        'Better reactions in interviews',
                        'People remember you after one sentence'
                    ],
                    nextDuration: 30,
                    nextChallenge: 'Ready to sharpen this in 30 seconds?'
                };
            case 30:
                return {
                    unlockTitle: 'This Version of You Works Best In',
                    unlocks: [
                        'Team intros',
                        'Client conversations',
                        'Interview openings'
                    ],
                    nextDuration: 60,
                    nextChallenge: 'Ready to turn clarity into trust in 60 seconds?'
                };
            case 60:
                return {
                    unlockTitle: 'This Version of You Works In',
                    unlocks: [
                        'Leadership conversations',
                        'High-stakes interviews',
                        'Founder & CEO intros',
                        'Client trust moments'
                    ],
                    nextDuration: null,
                    nextChallenge: 'Want to train this for real meetings?'
                };
            default:
                return {
                    unlockTitle: 'What This Unlocks',
                    unlocks: ['Better communication'],
                    nextDuration: null,
                    nextChallenge: 'Keep practicing!'
                };
        }
    };

    const content = getDurationSpecificContent();

    // Calculate improvement
    const firstScore = allAttempts[0]?.scores?.overall_score || 0;
    const finalScore = finalResult.scores.overall_score;
    const improvement = finalScore - firstScore;
    const improvementPercent = Math.round((improvement / firstScore) * 100);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="max-w-4xl w-full space-y-8">

                {/* Celebration Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-9xl mb-6"
                    >
                        🚀
                    </motion.div>
                    <h1 className="text-6xl font-black text-white mb-4">
                        Your Communication Upgrade
                    </h1>
                    <p className="text-2xl text-red-300">
                        {duration}s Challenge Complete
                    </p>
                </motion.div>

                {/* 1. Communication Archetype */}
                {finalResult.archetype && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-2 border-purple-500/50 rounded-3xl p-10"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
                                <span>🔥</span> Your Communication Archetype
                            </h2>
                        </div>

                        <div className="text-center">
                            <p className="text-5xl font-black text-purple-300 mb-6">
                                {finalResult.archetype.name}
                            </p>
                            <p className="text-2xl text-purple-100 leading-relaxed mb-6">
                                {finalResult.archetype.description}
                            </p>
                            <motion.div
                                className="bg-purple-900/40 rounded-2xl p-6 border-l-4 border-purple-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <p className="text-xl text-white font-semibold">
                                    💡 {finalResult.archetype.insight}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* 2. Transformation Story */}
                {finalResult.final_report && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-black/40 backdrop-blur-xl rounded-3xl p-10 border border-red-800/30"
                    >
                        <h2 className="text-4xl font-black text-white mb-8 text-center flex items-center justify-center gap-3">
                            <span>📈</span> Your Upgrade Story
                        </h2>

                        {/* Transformation Text */}
                        <div className="mb-8">
                            <p className="text-2xl text-white leading-relaxed text-center">
                                {finalResult.final_report.transformation_story}
                            </p>
                        </div>

                        {/* Progress Visualization */}
                        <div className="bg-red-900/20 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-red-300 font-semibold">Progress</span>
                                <span className="text-white font-bold text-xl">
                                    {improvement > 0 && '+'}{improvement} points
                                </span>
                            </div>

                            {/* Attempt Bars */}
                            <div className="space-y-3">
                                {allAttempts.map((attempt, index) => {
                                    const score = attempt.scores?.overall_score || 0;
                                    const width = (score / 100) * 100;

                                    return (
                                        <div key={index}>
                                            <div className="flex justify-between text-sm text-red-200 mb-1">
                                                <span>Attempt {index + 1}</span>
                                                <span>{Math.round(score)}</span>
                                            </div>
                                            <div className="h-4 bg-red-900/30 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${index === allAttempts.length - 1
                                                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                            : 'bg-gradient-to-r from-red-500 to-red-600'
                                                        }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${width}%` }}
                                                    transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Improvement Percentage */}
                            {improvement > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="mt-6 bg-green-900/30 border-2 border-green-500 rounded-xl p-4 text-center"
                                >
                                    <p className="text-3xl font-black text-green-400">
                                        +{improvementPercent}% Improvement
                                    </p>
                                    <p className="text-green-200 mt-2">
                                        You leveled up in {allAttempts.length} attempts
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* 3. The Core Pattern */}
                {finalResult.final_report?.core_pattern && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/50 rounded-3xl p-10"
                    >
                        <h2 className="text-4xl font-black text-white mb-6 text-center flex items-center justify-center gap-3">
                            <span>🧠</span> The ONE Pattern Holding You Back
                        </h2>
                        <p className="text-2xl text-orange-100 leading-relaxed text-center">
                            {finalResult.final_report.core_pattern}
                        </p>
                    </motion.div>
                )}

                {/* 4. Signature Move */}
                {finalResult.final_report?.signature_move && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-3xl p-10"
                    >
                        <h2 className="text-4xl font-black text-white mb-6 text-center flex items-center justify-center gap-3">
                            <span>✨</span> Your Signature Upgrade Move
                        </h2>
                        <div className="bg-black/30 rounded-2xl p-6 border-l-4 border-yellow-400">
                            <p className="text-2xl text-yellow-100 leading-relaxed">
                                {finalResult.final_report.signature_move}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* 5. What This Unlocks */}
                {finalResult.final_report?.unlocks && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-3xl p-10"
                    >
                        <h2 className="text-4xl font-black text-white mb-6 text-center flex items-center justify-center gap-3">
                            <span>🎯</span> {content.unlockTitle}
                        </h2>
                        <p className="text-xl text-green-100 leading-relaxed mb-6 text-center">
                            {finalResult.final_report.unlocks}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {content.unlocks.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.3 + index * 0.1 }}
                                    className="bg-green-900/20 rounded-xl p-4 flex items-center gap-3"
                                >
                                    <span className="text-2xl">✔</span>
                                    <span className="text-white font-semibold">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Shareable Insight */}
                {finalResult.final_report?.shareable_insight && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                        className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border-2 border-pink-500/50 rounded-3xl p-10 text-center"
                    >
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                            <span>✨</span> VoxMentor Insight
                        </h2>
                        <p className="text-3xl font-black text-pink-200 mb-6 leading-relaxed">
                            "{finalResult.final_report.shareable_insight}"
                        </p>
                        <button
                            className="px-8 py-3 bg-white/10 border-2 border-pink-400 text-pink-200 font-semibold rounded-xl hover:bg-white/20 transition-all"
                        >
                            📸 Share Insight
                        </button>
                    </motion.div>
                )}

                {/* Scores (Optional Toggle) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                >
                    <button
                        onClick={() => setShowScores(!showScores)}
                        className="w-full py-4 bg-black/30 border border-red-700/30 text-red-300 font-semibold rounded-xl hover:bg-black/40 transition-all"
                    >
                        {showScores ? '📊 Hide Detailed Scores' : '📊 Show Detailed Scores'}
                    </button>

                    {showScores && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 bg-black/30 rounded-2xl p-6 border border-red-800/30"
                        >
                            <p className="text-red-300 text-sm mb-4 text-center">For reference</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(finalResult.scores).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                        <p className="text-red-300 text-sm capitalize mb-2">
                                            {key.replace('_', ' ')}
                                        </p>
                                        <p className="text-3xl font-bold text-white">
                                            {Math.round(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    className="grid md:grid-cols-2 gap-4"
                >
                    {content.nextDuration && (
                        <button
                            onClick={onTryAnother}
                            className="py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl hover:shadow-xl transition-all"
                        >
                            🔁 {content.nextChallenge}
                        </button>
                    )}
                    <button className="py-6 bg-black/40 border-2 border-red-700 text-white font-semibold text-lg rounded-xl hover:bg-red-900/20 transition-all">
                        📄 Download Report
                    </button>
                </motion.div>

            </div>
        </div>
    );
}

export default FinalReport;