import React from 'react';
import { useNavigate } from 'react-router-dom';
import useQuestionsStore from '../store/questionsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Edit, MessageSquare, Eye } from 'lucide-react';

const QuestionList = () => {
  const questions = useQuestionsStore(state => state.questions);
  const navigate = useNavigate();

  const handleEdit = (questionId) => {
    navigate(`/edit/${questionId}`);
  };

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 pt-16">
        <Card className="border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-purple-900">Ready to Generate Questions</CardTitle>
            <CardDescription className="text-purple-700">
              Upload a resume above to get started. Your tailored interview questions will appear here in a
              structured table format with editing controls.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none mx-auto px-4 py-8">
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-purple-50 to-white border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-900">Interview Questions</CardTitle>
            <CardDescription className="text-purple-700">
              Each question is presented in a table format. Click the edit button to customize breadth, depth, and persona settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-purple-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider w-16">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider w-24">
                  Breadth
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider w-32">
                  Persona
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider w-20">
                  Depth
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider w-24">
                  Follow-ups
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-100">
              {questions.map((question, index) => (
                <tr key={question.id} className="hover:bg-purple-25 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900 w-16">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-800">
                    <div className="break-words whitespace-pre-wrap">
                      {question.main_question}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {question.controls?.breadth || question.breadth}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.controls?.persona || question.persona}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {question.controls?.depth === 0 ? 'None' : question.controls?.depth === 1 ? 'Low' : question.controls?.depth === 2 ? 'Medium' : question.controls?.depth === 3 ? 'High' : (question.depth === 0 ? 'None' : question.depth === 1 ? 'Low' : question.depth === 2 ? 'Medium' : question.depth === 3 ? 'High' : question.depth)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 w-24">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {question.follow_ups ? question.follow_ups.length : (question.followup_bank ? question.followup_bank.length : 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-20">
                    <Button
                      onClick={() => handleEdit(question.id)}
                      size="sm"
                      variant="outline"
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
