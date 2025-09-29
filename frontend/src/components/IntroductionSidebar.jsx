import React from 'react';
import { FileText, Users, Sparkles, Target, Clock, CheckCircle } from 'lucide-react';

const IntroductionSidebar = () => {
  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-white to-purple-50 rounded-2xl p-4 border border-purple-200 shadow-lg h-fit">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-bold text-purple-900 mb-1">Candidate Interview Script Designer</h2>
        <p className="text-purple-700 text-xs leading-relaxed">
          Transform resumes into tailored interview questions with AI-powered precision
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-3 h-3 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-purple-900">Smart Analysis</h3>
            <p className="text-xs text-purple-700 leading-relaxed">Extracts key information from resumes automatically</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target className="w-3 h-3 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-purple-900">Tailored Questions</h3>
            <p className="text-xs text-purple-700 leading-relaxed">Generates relevant questions based on candidate experience</p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-purple-900">AI-Powered</h3>
            <p className="text-xs text-purple-700 leading-relaxed">Advanced algorithms create contextual follow-up questions</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white/70 rounded-lg p-3 border border-purple-200">
        <h3 className="text-xs font-semibold text-purple-900 mb-2 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          How It Works
        </h3>
        <div className="space-y-1 text-xs text-purple-700">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-2.5 h-2.5 text-purple-500" />
            <span>Upload resume (PDF, DOCX, TXT)</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-2.5 h-2.5 text-purple-500" />
            <span>AI analyzes content and experience</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-2.5 h-2.5 text-purple-500" />
            <span>Generate tailored interview questions</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-2.5 h-2.5 text-purple-500" />
            <span>Customize and save your script</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionSidebar;
