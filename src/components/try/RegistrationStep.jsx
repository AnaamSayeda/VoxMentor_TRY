'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

function RegistrationStep({ onComplete }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        nativeLanguage: '',
        role: ''
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const roles = [
        { value: 'student', label: '🎓 Student', emoji: '🎓' },
        { value: 'professional', label: '💼 Professional', emoji: '💼' },
        { value: 'founder', label: '🚀 Founder', emoji: '🚀' },
        { value: 'other', label: '✨ Other', emoji: '✨' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRoleSelect = (role) => {
        setFormData(prev => ({ ...prev, role }));
        if (errors.role) {
            setErrors(prev => ({ ...prev, role: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Please enter your name';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.role) {
            newErrors.role = 'Please select your role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            // Generate unique user ID
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const userData = {
                user_id: userId,
                name: formData.name,
                email: formData.email,
                native_language: formData.nativeLanguage || null,
                role: formData.role,
                created_at: new Date().toISOString()
            };

            // Save to Supabase if configured
            if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                console.log('Saving user to Supabase...');

                const response = await fetch('/api/save-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    console.error('Failed to save user to Supabase');
                    // Continue anyway - don't block user
                }
            }

            // Pass to parent with additional fields for attempts table
            onComplete({
                ...formData,
                userId,
                createdAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error saving user:', error);
            // Continue anyway - don't block user
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            onComplete({
                ...formData,
                userId,
                createdAt: new Date().toISOString()
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-800/30"
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-4xl font-black text-white mb-3">
                        Quick Start 🚀
                    </h2>
                    <p className="text-red-200 text-lg">
                        Just a few details to personalize your experience
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className="block text-white font-semibold mb-2">
                            What's your name? *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className={`w-full px-4 py-3 bg-white/10 border ${errors.name ? 'border-red-500' : 'border-red-700/50'
                                } rounded-xl text-white placeholder-red-300/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                    </motion.div>

                    {/* Email Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-white font-semibold mb-2">
                            Email address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-500' : 'border-red-700/50'
                                } rounded-xl text-white placeholder-red-300/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                    </motion.div>

                    {/* Native Language Input (Optional) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <label className="block text-white font-semibold mb-2">
                            Native language <span className="text-red-400 text-sm">(optional)</span>
                        </label>
                        <input
                            type="text"
                            name="nativeLanguage"
                            value={formData.nativeLanguage}
                            onChange={handleChange}
                            placeholder="e.g., English, Spanish, Hindi"
                            className="w-full px-4 py-3 bg-white/10 border border-red-700/50 rounded-xl text-white placeholder-red-300/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                    </motion.div>

                    {/* Role Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label className="block text-white font-semibold mb-3">
                            I am a... *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((role, index) => (
                                <motion.button
                                    key={role.value}
                                    type="button"
                                    onClick={() => handleRoleSelect(role.value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.role === role.value
                                        ? 'bg-red-600 border-red-500 text-white'
                                        : 'bg-white/5 border-red-800/30 text-red-200 hover:border-red-600'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                >
                                    <div className="text-2xl mb-1">{role.emoji}</div>
                                    <div className="font-semibold text-sm">
                                        {role.label.replace(role.emoji + ' ', '')}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        {errors.role && (
                            <p className="text-red-400 text-sm mt-2">{errors.role}</p>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        whileHover={{ scale: isSaving ? 1 : 1.02 }}
                        whileTap={{ scale: isSaving ? 1 : 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                    >
                        {isSaving ? 'Saving...' : "Let's Go! 🔥"}
                    </motion.button>
                </form>

                <motion.p
                    className="text-center text-red-300/60 text-sm mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    Your data is safe and will never be shared
                </motion.p>
            </motion.div>
        </div>
    );
}

export default RegistrationStep;