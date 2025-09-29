import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useQuestionsStore from '../store/questionsStore';
import QuestionCard from './QuestionCard';
import FilterControls from './FilterControls';
import ProgressTracker from './ProgressTracker';
import QuestionNavigation from './QuestionNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Eye, EyeOff, Grid3X3, List } from 'lucide-react';

const QuestionList = () => {
  const questions = useQuestionsStore(state => state.questions);
  const navigate = useNavigate();
  
  // State for UI controls
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    breadth: null,
    persona: null,
    depth: null
  });

  // Filter questions based on active filters
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const questionBreadth = question.controls?.breadth || question.breadth;
      const questionPersona = question.controls?.persona || question.persona;
      const questionDepth = question.controls?.depth ?? question.depth;

      if (filters.breadth && questionBreadth !== filters.breadth) return false;
      if (filters.persona && questionPersona !== filters.persona) return false;
      if (filters.depth !== null && questionDepth !== filters.depth) return false;
      
      return true;
    });
  }, [questions, filters]);

  const handleEdit = (questionId) => {
    navigate(`/edit/${questionId}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    // Reset to first question when filters change
    setCurrentQuestionIndex(0);
  };

  const clearFilters = () => {
    setFilters({
      breadth: null,
      persona: null,
      depth: null
    });
    setCurrentQuestionIndex(0);
  };

  const handleQuestionNavigation = (direction) => {
    setCurrentQuestionIndex(prev => {
      if (direction === 'next') {
        return Math.min(prev + 1, filteredQuestions.length - 1);
      } else if (direction === 'previous') {
        return Math.max(prev - 1, 0);
      } else if (direction === 'first') {
        return 0;
      } else if (direction === 'last') {
        return filteredQuestions.length - 1;
      }
      return prev;
    });
  };

  const handleQuestionSelect = (questionNumber) => {
    setCurrentQuestionIndex(questionNumber - 1);
  };

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 pt-16">
        <Card className="border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-purple-900">Ready to Generate Questions</CardTitle>
            <CardDescription className="text-purple-700">
              Upload a resume above to get started. Your tailored interview questions will appear here with 
              modern navigation, filters, and collapsible follow-ups.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="w-full space-y-6">
        {/* Filters */}
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          isVisible={showFilters}
        />
        
        <Card className="border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-orange-900">No Questions Match Current Filters</CardTitle>
            <CardDescription className="text-orange-700">
              Try adjusting your filters or clear them to see all questions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" role="main" aria-label="Interview questions">
      {/* Header Controls */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        role="toolbar"
        aria-label="Question display controls"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Questions</h2>
          <p className="text-gray-600">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'} 
            {filteredQuestions.length !== questions.length && ` (filtered from ${questions.length})`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            {showFilters ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          
          <div className="flex rounded-lg border border-gray-200 p-1 bg-white">
            <Button
              onClick={() => setViewMode('single')}
              variant={viewMode === 'single' ? 'default' : 'ghost'}
              size="sm"
              className="px-3 py-1"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="px-3 py-1"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterControls
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        isVisible={showFilters}
      />

      {/* Progress Tracker */}
      {viewMode === 'single' && (
        <ProgressTracker
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={filteredQuestions.length}
          onQuestionSelect={handleQuestionSelect}
        />
      )}

      {/* Questions Display */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {viewMode === 'single' ? (
            /* Single Question View */
            <motion.div
              key={`single-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionCard
                question={filteredQuestions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={filteredQuestions.length}
                onEdit={handleEdit}
                isCurrentQuestion={true}
              />
            </motion.div>
          ) : (
            /* List View */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredQuestions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  totalQuestions={filteredQuestions.length}
                  onEdit={handleEdit}
                  isCurrentQuestion={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {viewMode === 'single' && (
        <QuestionNavigation
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={filteredQuestions.length}
          onPrevious={() => handleQuestionNavigation('previous')}
          onNext={() => handleQuestionNavigation('next')}
          onFirst={() => handleQuestionNavigation('first')}
          onLast={() => handleQuestionNavigation('last')}
        />
      )}
    </div>
  );
};

export default QuestionList;
