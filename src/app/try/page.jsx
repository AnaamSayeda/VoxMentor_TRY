'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingStep from '@/components/try/LandingStep';
import RegistrationStep from '@/components/try/RegistrationStep';
import WarmupTest from '@/components/try/WarmupTest';
import ScenarioSelection from '@/components/try/ScenarioSelection';
import RecordingStep from '@/components/try/RecordingStep';
import CoachingFeedback from '@/components/try/CoachingFeedback';

const STEPS = {
  LANDING: 'landing',
  REGISTRATION: 'registration',
  WARMUP: 'warmup',
  SCENARIO: 'scenario',
  RECORDING: 'recording',
  COACHING: 'coaching',
  COMPLETE: 'complete'
};

export default function TryPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.LANDING);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    userId: null
  });

  const [selectedDuration, setSelectedDuration] = useState(15);
  const [currentRound, setCurrentRound] = useState(1);
  const [attempts, setAttempts] = useState([]);
  const [currentCoaching, setCurrentCoaching] = useState(null);
  const [completedDurations, setCompletedDurations] = useState([]);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('voxmentor_progress');
    if (saved) {
      const progress = JSON.parse(saved);
      setUserData(progress.userData || userData);
      setCompletedDurations(progress.completedDurations || []);
    }
  }, []);

  // Save progress
  const saveProgress = () => {
    localStorage.setItem('voxmentor_progress', JSON.stringify({
      userData,
      completedDurations,
      timestamp: new Date().toISOString()
    }));
  };

  const handleStartChallenge = () => {
    setCurrentStep(STEPS.REGISTRATION);
  };

  const handleRegistrationComplete = (data) => {
    setUserData(data);
    localStorage.setItem('voxmentor_progress', JSON.stringify({
      userData: data,
      completedDurations,
      timestamp: new Date().toISOString()
    }));
    setCurrentStep(STEPS.WARMUP);
  };

  const handleWarmupComplete = () => {
    setCurrentStep(STEPS.SCENARIO);
  };

  const handleScenarioSelect = (duration) => {
    setSelectedDuration(duration);
    setCurrentRound(1);
    setAttempts([]);
    setCurrentCoaching(null);
    setCurrentStep(STEPS.RECORDING);
  };

  const handleRecordingComplete = (result) => {
    // Save attempt
    const attempt = {
      round: currentRound,
      transcript: result.transcript,
      ...result,
      timestamp: new Date().toISOString()
    };

    const updatedAttempts = [...attempts, attempt];
    setAttempts(updatedAttempts);
    setCurrentCoaching(result);
    setCurrentStep(STEPS.COACHING);
  };

  const handleCoachingContinue = () => {
    if (currentRound >= 3) {
      // Challenge complete
      if (!completedDurations.includes(selectedDuration)) {
        const newCompleted = [...completedDurations, selectedDuration];
        setCompletedDurations(newCompleted);
        localStorage.setItem('voxmentor_progress', JSON.stringify({
          userData,
          completedDurations: newCompleted,
          timestamp: new Date().toISOString()
        }));
      }
      setCurrentStep(STEPS.COMPLETE);
    } else {
      // Next round
      setCurrentRound(currentRound + 1);
      setCurrentStep(STEPS.RECORDING);
    }
  };

  const handleTryAnother = () => {
    setCurrentRound(1);
    setAttempts([]);
    setCurrentCoaching(null);
    setCurrentStep(STEPS.SCENARIO);
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.LANDING:
        return <LandingStep onStart={handleStartChallenge} />;

      case STEPS.REGISTRATION:
        return <RegistrationStep onComplete={handleRegistrationComplete} />;

      case STEPS.WARMUP:
        return <WarmupTest onComplete={handleWarmupComplete} />;

      case STEPS.SCENARIO:
        return (
          <ScenarioSelection
            onSelect={handleScenarioSelect}
            completedDurations={completedDurations}
          />
        );

      case STEPS.RECORDING:
        return (
          <RecordingStep
            duration={selectedDuration}
            attemptNumber={currentRound}
            onComplete={handleRecordingComplete}
            userData={userData}
            previousAttempts={attempts}
          />
        );

      case STEPS.COACHING:
        return (
          <CoachingFeedback
            coaching={currentCoaching}
            attemptNumber={currentRound}
            duration={selectedDuration}
            onContinue={handleCoachingContinue}
          />
        );

      case STEPS.COMPLETE:
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full text-center"
            >
              <div className="text-9xl mb-8">🎉</div>
              <h1 className="text-6xl font-black text-white mb-6">
                Challenge Complete!
              </h1>
              <p className="text-2xl text-red-200 mb-12">
                You've mastered the {selectedDuration}-second introduction
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleTryAnother}
                  className="w-full py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xl rounded-xl"
                >
                  🔁 Try Another Duration
                </button>

                <button className="w-full py-4 bg-black/40 border-2 border-red-700 text-white font-semibold text-lg rounded-xl">
                  📄 Download Certificate
                </button>
              </div>

              <div className="mt-12 bg-black/30 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">🏆 Unlocked:</h3>
                <div className="flex justify-center gap-4">
                  {[15, 30, 60].map(dur => (
                    <div
                      key={dur}
                      className={`px-6 py-3 rounded-xl font-bold ${completedDurations.includes(dur)
                        ? 'bg-green-500 text-white'
                        : 'bg-red-900/30 text-red-400'
                        }`}
                    >
                      {dur}s {completedDurations.includes(dur) && '✓'}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        );

      default:
        return <LandingStep onStart={handleStartChallenge} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}