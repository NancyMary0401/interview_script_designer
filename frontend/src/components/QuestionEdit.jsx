import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, RefreshCw, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import useQuestionsStore from '../store/questionsStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const QuestionEdit = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { questions, updateQuestion, updateLocalQuestion, loading } = useQuestionsStore();

  const question = questions.find(q => q.id === questionId);
  console.log('questionId:', questionId, typeof questionId);
  console.log('questions:', questions);
  console.log('Available question IDs:', questions.map(q => ({ id: q.id, type: typeof q.id })));
  console.log('question:', question);

  // Try different matching strategies
  const questionByStringId = questions.find(q => q.id === questionId);
  const questionByNumberId = questions.find(q => q.id === Number(questionId));
  const questionByStringifiedId = questions.find(q => String(q.id) === questionId);

  const foundQuestion = questionByStringId || questionByNumberId || questionByStringifiedId;
  console.log('foundQuestion:', foundQuestion);
  if (!foundQuestion) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 pt-16">
        <Card className="border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-purple-900">Question Not Found</CardTitle>
            <CardDescription className="text-purple-700">
              The requested question could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleLocalChange = (field, value) => {
    const updatedQuestion = { ...foundQuestion };

    // Handle nested controls structure
    if (field === 'breadth' || field === 'depth' || field === 'persona') {
      updatedQuestion.controls = {
        ...updatedQuestion.controls,
        [field]: value
      };
    } else {
      updatedQuestion[field] = value;
    }

    updateLocalQuestion(foundQuestion.id, updatedQuestion);
  };

  const handleSave = () => {
    // Save changes and navigate back
    navigate('/');
  };

  const handleRegenerateFollowups = () => {
    updateQuestion(foundQuestion.id, { regenerate_followups: true });
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Button>
        <h2 className="text-2xl font-bold text-purple-900">Edit Question {questions.findIndex(q => q.id === foundQuestion.id) + 1}</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border border-purple-200 shadow-lg">
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-purple-900 mb-2">Main Question</CardTitle>
                <Input
                  value={foundQuestion.main_question}
                  onChange={(e) => handleLocalChange('main_question', e.target.value)}
                  className="text-base font-medium text-purple-900 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white"
                  placeholder="Enter main question..."
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={handleRegenerateFollowups}
                  disabled={loading}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Controls Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breadth */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-purple-700 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Breadth
                </label>
                <Select
                  onValueChange={(value) => handleLocalChange('breadth', value)}
                  defaultValue={foundQuestion.controls?.breadth || foundQuestion.breadth}
                >
                  <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white">
                    <SelectValue placeholder="Select breadth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Persona */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-purple-700 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Persona
                </label>
                <Select
                  onValueChange={(value) => handleLocalChange('persona', value)}
                  defaultValue={foundQuestion.controls?.persona || foundQuestion.persona || 'Evidence-first'}
                >
                  <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white">
                    <SelectValue placeholder="Select persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Evidence-first">Evidence-first</SelectItem>
                    <SelectItem value="Why-How">Why-How</SelectItem>
                    <SelectItem value="Metrics-Driven">Metrics-Driven</SelectItem>
                    <SelectItem value="Storytelling">Storytelling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Depth */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-purple-700 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Depth: {foundQuestion.controls?.depth === 0 ? 'None' : foundQuestion.controls?.depth === 1 ? 'Low' : foundQuestion.controls?.depth === 2 ? 'Medium' : foundQuestion.controls?.depth === 3 ? 'High' : (foundQuestion.depth === 0 ? 'None' : foundQuestion.depth === 1 ? 'Low' : foundQuestion.depth === 2 ? 'Medium' : foundQuestion.depth === 3 ? 'High' : foundQuestion.depth)}
                </label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={3}
                    step={1}
                    defaultValue={[foundQuestion.controls?.depth || foundQuestion.depth || 1]}
                    onValueChange={(value) => handleLocalChange('depth', value[0])}
                    className="flex-1"
                  />
                  <div className="flex justify-between text-xs text-purple-600">
                    <span>None</span>
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up Questions */}
            {foundQuestion.follow_ups && foundQuestion.follow_ups.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-purple-800 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Follow-up Questions
                  </h4>
                  <div className="inline-flex items-center justify-center h-7 px-3 rounded-full bg-purple-100 text-purple-700 text-sm font-medium border border-purple-200">
                    {foundQuestion.follow_ups.length} questions
                  </div>
                </div>

                <div className="grid gap-3">
                  {foundQuestion.follow_ups.map((followup, followupIndex) => (
                    <div key={`${foundQuestion.id}-followup-${followupIndex}`} className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-start space-x-3">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-200 text-sm text-purple-700 font-medium flex-shrink-0 mt-0.5">
                          {followupIndex + 1}
                        </span>
                        <span className="flex-1 text-sm text-purple-800 leading-relaxed font-medium">{followup.question}</span>
                      </div>
                      {followup.nested && followup.nested.length > 0 && (
                        <div className="ml-9 space-y-2">
                          {followup.nested.map((nestedQuestion, nestedIndex) => (
                            <div key={`${foundQuestion.id}-nested-${followupIndex}-${nestedIndex}`} className="flex items-start space-x-2">
                              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-purple-100 text-xs text-purple-600 font-medium flex-shrink-0 mt-0.5">
                                {nestedIndex + 1}
                              </span>
                              <span className="flex-1 text-xs text-purple-700 leading-relaxed">{nestedQuestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuestionEdit;
