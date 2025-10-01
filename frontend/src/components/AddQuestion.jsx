import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BarChart3, User, Settings2, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';
import useQuestionsStore from '../store/questionsStore';

const AddQuestion = () => {
  const { addQuestion, loading, resumeText } = useQuestionsStore();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    main_question: '',
    breadth: 'Low',
    depth: 0,
    persona: 'Why-How',
    claim: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadthOptions = [
    { value: 'Low', label: 'Low', description: 'Focused, specific questions' },
    { value: 'Medium', label: 'Medium', description: 'Balanced scope questions' },
    { value: 'High', label: 'High', description: 'Broad, comprehensive questions' }
  ];

  const personaOptions = [
    { value: 'Evidence-first', label: 'Evidence-first', description: 'Focus on concrete examples and proof' },
    { value: 'Why-How', label: 'Why-How', description: 'Explore reasoning and methodology' },
    { value: 'Metrics-Driven', label: 'Metrics-Driven', description: 'Emphasize quantifiable results' },
    { value: 'Storytelling', label: 'Storytelling', description: 'Encourage narrative explanations' }
  ];

  const depthLabels = ['None', 'Low', 'Medium', 'High'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.main_question.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a main question.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addQuestion(formData);
      
      toast({
        title: 'Question Added!',
        description: 'Your new question has been added successfully.',
      });
      
      // Reset form and close dialog
      setFormData({
        main_question: '',
        breadth: 'Low',
        depth: 0,
        persona: 'Why-How',
        claim: ''
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      main_question: '',
      breadth: 'Low',
      depth: 0,
      persona: 'Why-How',
      claim: ''
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
        disabled={loading}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Question
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <Plus className="w-5 h-5 text-green-600" />
              <span>Add New Question</span>
            </DialogTitle>
            <DialogDescription>
              Create a custom interview question with your preferred parameters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Question */}
            <div className="space-y-2">
              <Label htmlFor="main_question" className="text-sm font-medium">
                Main Question *
              </Label>
              <Input
                id="main_question"
                value={formData.main_question}
                onChange={(e) => handleInputChange('main_question', e.target.value)}
                placeholder="Enter your interview question..."
                className="w-full"
                required
              />
            </div>

            {/* Claim (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="claim" className="text-sm font-medium">
                Related Claim (Optional)
              </Label>
              <Input
                id="claim"
                value={formData.claim}
                onChange={(e) => handleInputChange('claim', e.target.value)}
                placeholder="What resume claim does this question address?"
                className="w-full"
              />
            </div>

            {/* Question Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Breadth */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Breadth</span>
                </Label>
                <Select value={formData.breadth} onValueChange={(value) => handleInputChange('breadth', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {breadthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Persona */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Persona</span>
                </Label>
                <Select value={formData.persona} onValueChange={(value) => handleInputChange('persona', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Depth */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-orange-600" />
                <span>Depth: {depthLabels[formData.depth]}</span>
              </Label>
              <div className="px-3">
                <Slider
                  value={[formData.depth]}
                  onValueChange={([value]) => handleInputChange('depth', value)}
                  max={3}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Resume Text Warning */}
            {!resumeText && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">No Resume Context</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Follow-up questions may not be generated without resume context. Upload a resume first for better results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isSubmitting ? 'Adding Question...' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddQuestion;
