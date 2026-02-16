'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

function FinalResult({ attempts, duration, userData, completedDurations, onTryAnother }) {
    const [emailSent, setEmailSent] = useState(false);

    // Calculate improvement
    const firstAttempt = attempts[0];
    const lastAttempt = attempts[attempts.length - 1];
    const improvement = lastAttempt.totalScore - firstAttempt.totalScore;
    const improvementPercentage = ((improvement / firstAttempt.totalScore) * 100).toFixed(0);

    // Determine badge
    const getBadge = () => {
        const finalScore = lastAttempt.totalScore;
        if (finalScore >= 27) return { emoji: '🏆', title: 'Structure Pro', color: 'from-yellow-500 to-yellow-600' };
        if (finalScore >= 24) return { emoji: '🔥', title: 'Confident Speaker', color: 'from-orange-500 to-red-600' };
        return { emoji: '⭐', title: 'Clear Starter', color: 'from-blue-500 to-purple-600' };
    };

    const badge = getBadge();

    const handleDownloadPDF = async () => {
        // TODO: Implement PDF generation
        alert('PDF download will be implemented!');
    };

    const handleEmailResults = async () => {
        try {
            // TODO: Implement email sending via API
            const response = await fetch('/api/send-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userData.email,
                    attempts,
                    duration,
                    badge
                })
            });

            if (response.ok) {
                setEmailSent(true);
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    // Check what durations are available to unlock
    const getNextChallenge = () => {
        if (!completedDurations.includes(10)) return null;
        if (!completedDurations.includes(30)) return { duration: 30, label: '30-second' };
        if (!completedDurations.includes(60)) return { duration: 60, label: '60-second' };
        return null;
    };

    const nextChallenge = getNextChallenge();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="max-w-4xl w-full">
                {/* Celebration Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="text-8xl mb-4"
                    >
                        🎉
                    </motion.div>
                    <h1 className="text-6xl font-black text-white mb-4">
                        You Did It!
                    </h1>
                    <p className="text-2xl text-red-200">
                        Here's your complete performance report
                    </p>
                </motion.div>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center mb-8"
                >
                    <div className={`bg-gradient-to-r ${badge.color} rounded-3xl p-8 shadow-2xl`}>
                        <div className="text-center">
                            <div className="text-7xl mb-3">{badge.emoji}</div>
                            <div className="text-3xl font-black text-white">
                                {badge.title}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Improvement Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-red-800/30 mb-8"
                >
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">
                        📈 Your Progress
                    </h2>

                    {/* Improvement Graph */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end h-64 px-4">
                            {attempts.map((attempt, index) => {
                                const height = (attempt.totalScore / 30) * 100;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                                        className="flex-1 mx-2 bg-gradient-to-t from-red-600 to-red-400 rounded-t-xl relative group"
                                    >
                                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap">
                                                Attempt {index + 1}: {attempt.totalScore}/30
                                            </div>
                                        </div>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                                            <div className="text-2xl font-black text-white">
                                                {attempt.totalScore}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between px-4 mt-4">
                            {attempts.map((_, index) => (
                                <div key={index} className="flex-1 mx-2 text-center text-red-300 text-sm font-semibold">
                                    Try {index + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Improvement Message */}
                    {improvement > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="bg-green-900/30 border-2 border-green-500 rounded-2xl p-6 text-center"
                        >
                            <p className="text-3xl font-black text-green-400 mb-2">
                                +{improvement} points ({improvementPercentage > 0 ? '+' : ''}{improvementPercentage}%)
                            </p>
                            <p className="text-green-200 text-lg">
                                You improved your clarity by <strong>{improvementPercentage}%</strong> in {attempts.length} attempts!
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="bg-blue-900/30 border-2 border-blue-500 rounded-2xl p-6 text-center"
                        >
                            <p className="text-blue-200 text-lg">
                                Great job completing the challenge! Keep practicing to improve even more.
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Score Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7 }}
                    className="grid md:grid-cols-3 gap-4 mb-8"
                >
                    {Object.entries(lastAttempt.scores).map(([key, value], index) => (
                        <div
                            key={key}
                            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-800/30 text-center"
                        >
                            <div className="text-sm text-red-300 uppercase tracking-wider mb-2">
                                Final {key}
                            </div>
                            <div className={`text-5xl font-black mb-1 ${value >= 8 ? 'text-green-400' : value >= 6 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {value}
                            </div>
                            <div className="text-sm text-red-400">/ 10</div>
                        </div>
                    ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.9 }}
                    className="grid md:grid-cols-2 gap-4 mb-8"
                >
                    <button
                        onClick={handleDownloadPDF}
                        className="py-4 bg-black/40 border-2 border-red-700 text-white font-bold rounded-xl hover:bg-red-900/20 transition-all"
                    >
                        📄 Download PDF
                    </button>
                    <button
                        onClick={handleEmailResults}
                        disabled={emailSent}
                        className={`py-4 font-bold rounded-xl transition-all ${emailSent
                                ? 'bg-green-600 text-white'
                                : 'bg-black/40 border-2 border-red-700 text-white hover:bg-red-900/20'
                            }`}
                    >
                        {emailSent ? '✅ Results Emailed!' : '✉️ Email Results'}
                    </button>
                </motion.div>

                {/* Next Challenge */}
                {nextChallenge && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.1 }}
                        className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center mb-8"
                    >
                        <h3 className="text-2xl font-bold text-white mb-4">
                            🎯 Ready for More?
                        </h3>
                        <p className="text-red-100 mb-6">
                            You've unlocked the {nextChallenge.label} challenge!
                        </p>
                        <button
                            onClick={onTryAnother}
                            className="px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                        >
                            Try {nextChallenge.label} Challenge 🔥
                        </button>
                    </motion.div>
                )}

                {/* Try Another Scenario Button (Always Available) */}
                <motion.button
                    onClick={onTryAnother}
                    className="w-full py-5 bg-gradient-to-r from-red-700 to-red-800 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-red-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.3 }}
                >
                    🔁 Try Another Duration
                </motion.button>

                {/* Optional: Book Session CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="mt-8 text-center"
                >
                    <p className="text-red-300 mb-4">
                        Want personalized 1-on-1 coaching?
                    </p>
                    <button className="px-8 py-3 bg-black/40 border-2 border-red-700 text-white font-semibold rounded-xl hover:bg-red-900/20 transition-all">
                        📅 Book Free Session
                    </button>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.7 }}
                    className="mt-12 text-center text-red-300/60 text-sm"
                >
                    <p>
                        Join 10,000+ professionals improving their communication skills with VoxMentor
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default FinalResult;