import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { Button } from './ui/button';

const QuestionNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  onPrevious, 
  onNext, 
  onFirst, 
  onLast,
  isVisible = true 
}) => {
  if (!isVisible || totalQuestions === 0) return null;

  const isFirst = currentQuestion === 1;
  const isLast = currentQuestion === totalQuestions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between w-full bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4"
      role="navigation"
      aria-label="Question navigation controls"
    >
      {/* Left Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={onFirst}
          disabled={isFirst}
          variant="outline"
          size="sm"
          className={`${isFirst ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          title="Go to first question"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          onClick={onPrevious}
          disabled={isFirst}
          variant="outline"
          size="sm"
          className={`${isFirst ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          title="Previous question"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
      </div>

      {/* Current Question Display */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Current Question</div>
          <div className="text-xl font-bold text-purple-600">
            {currentQuestion}
          </div>
        </div>
        <div className="text-gray-400">
          <span className="text-sm">of</span>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Total Questions</div>
          <div className="text-xl font-bold text-gray-700">
            {totalQuestions}
          </div>
        </div>
      </div>

      {/* Right Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={onNext}
          disabled={isLast}
          variant="outline"
          size="sm"
          className={`${isLast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          title="Next question"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          onClick={onLast}
          disabled={isLast}
          variant="outline"
          size="sm"
          className={`${isLast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          title="Go to last question"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default QuestionNavigation;
