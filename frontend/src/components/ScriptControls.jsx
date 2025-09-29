import React from 'react';
import useQuestionsStore from '../store/questionsStore';
import { Button } from './ui/button';
import JsonViewer from './JsonViewer';
import { useToast } from './ui/use-toast';

const ScriptControls = () => {
  const { saveScript, loading, questions } = useQuestionsStore();
  const { toast } = useToast();

  const handleSave = async () => {
    await saveScript();
    toast({
      title: 'Script Saved!',
      description: 'Your interview script has been successfully saved.',
    });
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 p-6 bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-xl shadow-sm flex justify-end items-center gap-4">
      <JsonViewer>
        <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400">
          View JSON
        </Button>
      </JsonViewer>
      <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg">
        {loading ? 'Saving...' : 'Save Script'}
      </Button>
    </div>
  );
};

export default ScriptControls;
