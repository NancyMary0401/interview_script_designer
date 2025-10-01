import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Edit, BarChart3, User, Settings2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const QuestionCard = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onEdit, 
  onDelete,
  isCurrentQuestion = false 
}) => {
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getDepthLabel = (depth) => {
    if (depth === 0) return 'None';
    if (depth === 1) return 'Low';
    if (depth === 2) return 'Medium';
    if (depth === 3) return 'High';
    return depth;
  };

  const getBadgeColor = (type, value) => {
    const colors = {
      breadth: {
        'Low': 'bg-blue-100 text-blue-800 border-blue-200',
        'Medium': 'bg-blue-200 text-blue-900 border-blue-300',
        'High': 'bg-blue-300 text-blue-900 border-blue-400'
      },
      persona: {
        'Evidence-first': 'bg-green-100 text-green-800 border-green-200',
        'Why-How': 'bg-purple-100 text-purple-800 border-purple-200',
        'Metrics-Driven': 'bg-orange-100 text-orange-800 border-orange-200',
        'Storytelling': 'bg-pink-100 text-pink-800 border-pink-200'
      },
      depth: {
        'None': 'bg-gray-100 text-gray-800 border-gray-200',
        'Low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Medium': 'bg-orange-100 text-orange-800 border-orange-200',
        'High': 'bg-red-100 text-red-800 border-red-200'
      }
    };
    return colors[type]?.[value] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const followUpCount = question.follow_ups?.length || question.followup_bank?.length || 0;
  const breadth = question.controls?.breadth || question.breadth;
  const persona = question.controls?.persona || question.persona;
  const depth = getDepthLabel(question.controls?.depth ?? question.depth);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(question.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`relative ${isCurrentQuestion ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
    >
      <Card 
        className={`bg-white/95 backdrop-blur-sm border transition-all duration-200 hover:shadow-lg ${
          isCurrentQuestion ? 'border-purple-300 shadow-md' : 'border-gray-200'
        }`}
        role="article"
        aria-label={`Question ${questionNumber}: ${question.main_question}`}
        tabIndex={isCurrentQuestion ? 0 : -1}
      >
        <CardHeader className="pb-4">
          {/* Question Number and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                isCurrentQuestion 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {questionNumber}
              </div>
              <div className="text-sm text-gray-500">
                Question {questionNumber} of {totalQuestions}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onEdit(question.id)}
                size="sm"
                variant="outline"
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Question</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this question? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Question to be deleted:</p>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                      {question.main_question}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      Delete Question
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Main Question */}
          <div className="space-y-4">
          <h3 
            className="text-xl font-semibold text-gray-900 leading-relaxed"
            id={`question-${question.id}-title`}
          >
            {question.main_question}
          </h3>

            {/* Question Metadata */}
            <div className="flex flex-wrap gap-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor('breadth', breadth)}`}>
                <BarChart3 className="w-3 h-3 mr-1" />
                {breadth}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor('persona', persona)}`}>
                <User className="w-3 h-3 mr-1" />
                {persona}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor('depth', depth)}`}>
                <Settings2 className="w-3 h-3 mr-1" />
                {depth}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Follow-up Questions Section */}
        {followUpCount > 0 && (
          <CardContent className="pt-0">
            <Collapsible open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto hover:bg-gray-50 text-left"
                  aria-expanded={isFollowUpOpen}
                  aria-controls={`followups-${question.id}`}
                  aria-label={`${isFollowUpOpen ? 'Hide' : 'Show'} ${followUpCount} follow-up questions`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-700">
                      Follow-up Questions ({followUpCount})
                    </span>
                  </div>
                  {isFollowUpOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <AnimatePresence>
                {isFollowUpOpen && (
                  <CollapsibleContent asChild>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                      id={`followups-${question.id}`}
                      role="region"
                      aria-labelledby={`question-${question.id}-title`}
                    >
                      <div className="space-y-3 pt-3">
                        {(question.follow_ups || question.followup_bank || []).map((followup, index) => (
                          <motion.div
                            key={`followup-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 leading-relaxed">
                                  {typeof followup === 'string' ? followup : followup.question}
                                </p>
                                {/* Nested questions if they exist */}
                                {followup.nested && followup.nested.length > 0 && (
                                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-purple-100">
                                    {followup.nested.map((nested, nestedIndex) => (
                                      <div key={`nested-${nestedIndex}`} className="flex items-start space-x-2">
                                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-50 text-purple-600 text-xs font-medium flex-shrink-0 mt-0.5">
                                          {nestedIndex + 1}
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                          {nested}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
