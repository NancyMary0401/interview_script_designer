import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const ProgressTracker = ({ 
  currentQuestion, 
  totalQuestions, 
  onQuestionSelect,
  isVisible = true 
}) => {
  if (!isVisible || totalQuestions === 0) return null;

  const progressPercentage = ((currentQuestion) / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4"
      role="region"
      aria-label="Progress tracker"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Progress</h3>
        <div className="text-sm text-gray-600">
          {currentQuestion} of {totalQuestions} questions
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Start</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
          <span>End</span>
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div 
        className="flex flex-wrap gap-2 justify-center"
        role="navigation"
        aria-label="Question navigation"
      >
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNumber = index + 1;
          const isCompleted = questionNumber < currentQuestion;
          const isCurrent = questionNumber === currentQuestion;
          
          return (
            <motion.button
              key={questionNumber}
              onClick={() => onQuestionSelect && onQuestionSelect(questionNumber)}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                isCurrent
                  ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-2'
                  : isCompleted
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              } ${onQuestionSelect ? 'cursor-pointer' : 'cursor-default'}`}
              whileHover={onQuestionSelect ? { scale: 1.1 } : {}}
              whileTap={onQuestionSelect ? { scale: 0.95 } : {}}
              disabled={!onQuestionSelect}
              title={`Question ${questionNumber}${isCurrent ? ' (Current)' : isCompleted ? ' (Completed)' : ''}`}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span>{questionNumber}</span>
              )}
              
              {/* Connection line to next dot */}
              {index < totalQuestions - 1 && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-2 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Completion Status */}
      {progressPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
        >
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-green-800">
            All questions reviewed!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressTracker;
