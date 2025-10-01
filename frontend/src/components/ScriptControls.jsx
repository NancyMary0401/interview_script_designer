import React, { useState } from 'react';
import useQuestionsStore from '../store/questionsStore';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { CheckCircle, Save, FileText, Calendar, Download } from 'lucide-react';
import { Loader } from './ui/loader';
import JsonViewer from './JsonViewer';
import { useToast } from './ui/use-toast';

const ScriptControls = () => {
  const { saveScript, loading, questions } = useQuestionsStore();
  const { toast } = useToast();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSave = async () => {
    try {
      await saveScript();
      // Show both toast and dialog
      toast({
        title: 'Script Saved!',
        description: 'Your interview script has been successfully saved.',
      });
      setShowSuccessDialog(true);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'There was an error saving the script. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handleDownloadScript = () => {
    try {
      // Create a comprehensive script object
      const scriptData = {
        metadata: {
          title: "Interview Script",
          generatedAt: new Date().toISOString(),
          totalQuestions: questions.length,
          version: "1.0"
        },
        questions: questions.map((question, index) => ({
          id: question.id,
          questionNumber: index + 1,
          mainQuestion: question.main_question,
          breadth: question.controls?.breadth || question.breadth,
          persona: question.controls?.persona || question.persona,
          depth: question.controls?.depth ?? question.depth,
          followUps: question.follow_ups || question.followup_bank || [],
          claim: question.claim || null
        })),
        summary: {
          totalQuestions: questions.length,
          breadthDistribution: questions.reduce((acc, q) => {
            const breadth = q.controls?.breadth || q.breadth;
            acc[breadth] = (acc[breadth] || 0) + 1;
            return acc;
          }, {}),
          personaDistribution: questions.reduce((acc, q) => {
            const persona = q.controls?.persona || q.persona;
            acc[persona] = (acc[persona] || 0) + 1;
            return acc;
          }, {}),
          averageDepth: questions.reduce((sum, q) => sum + (q.controls?.depth ?? q.depth), 0) / questions.length
        }
      };

      // Convert to JSON string with proper formatting
      const jsonString = JSON.stringify(scriptData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-script-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Close dialog and show success toast
      closeSuccessDialog();
      toast({
        title: 'Download Started!',
        description: 'Your interview script has been downloaded successfully.',
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the script. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReadable = () => {
    try {
      // Create a readable text format
      const readableText = `Interview Script
Generated on: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}

Total Questions: ${questions.length}

${'='.repeat(50)}

${questions.map((question, index) => {
  const questionNum = index + 1;
  const breadth = question.controls?.breadth || question.breadth;
  const persona = question.controls?.persona || question.persona;
  const depth = question.controls?.depth ?? question.depth;
  
  let text = `Question ${questionNum}: ${question.main_question}

Metadata:
- Breadth: ${breadth}
- Persona: ${persona}
- Depth: ${depth === 0 ? 'None' : depth === 1 ? 'Low' : depth === 2 ? 'Medium' : 'High'}

`;
  
  // Add follow-up questions if they exist
  const followUps = question.follow_ups || question.followup_bank || [];
  if (followUps.length > 0) {
    text += `Follow-up Questions:
`;
    followUps.forEach((followup, followupIndex) => {
      const questionText = typeof followup === 'string' ? followup : followup.question;
      text += `${followupIndex + 1}. ${questionText}`;
      
      // Add nested questions if they exist
      if (followup.nested && followup.nested.length > 0) {
        followup.nested.forEach((nested, nestedIndex) => {
          text += `
   ${followupIndex + 1}.${nestedIndex + 1} ${nested}`;
        });
      }
      text += `
`;
    });
    text += `
${'-'.repeat(40)}

`;
  }
  
  return text;
}).join('')}

This script was generated by the Interview Script Designer.
Version: 1.0`;

      // Create blob and download
      const blob = new Blob([readableText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-script-readable-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success toast
      toast({
        title: 'Download Started!',
        description: 'Your script has been downloaded in readable text format.',
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the script. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-8 p-6 bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-xl shadow-sm flex justify-end items-center gap-4">
        <JsonViewer>
          <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400">
            View JSON
          </Button>
        </JsonViewer>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg">
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2" size="sm" />
              Saving...
            </>
          ) : (
            'Save Script'
          )}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span>Script Saved Successfully!</span>
            </DialogTitle>
            <DialogDescription className="pt-4 text-base">
              Your interview script has been saved and is ready for use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Script Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-gray-700">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{questions.length} Interview Questions</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Saved on {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Action Message */}
            <p className="text-sm text-gray-600 text-center">
              Your script is now saved and can be shared with your team or used for future interviews.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4">
            <Button variant="outline" onClick={closeSuccessDialog} className="w-full sm:w-auto">
              Close
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleDownloadScript} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                JSON Format
              </Button>
              <Button onClick={handleDownloadReadable} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Text Format
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScriptControls;
