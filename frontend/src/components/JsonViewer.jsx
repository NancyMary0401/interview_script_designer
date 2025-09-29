import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import useQuestionsStore from '../store/questionsStore';

const JsonViewer = ({ children }) => {
  const questions = useQuestionsStore(state => state.questions);
  const [jsonString, setJsonString] = useState('');

  useEffect(() => {
    setJsonString(JSON.stringify(questions, null, 2));
  }, [questions]);

  const handleSave = () => {
    // In a real app, you might want to parse and update the store here
    // For now, we just close the dialog
    console.log('JSON saved (locally in component state)');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Raw Interview Script (JSON)</DialogTitle>
        </DialogHeader>
        <div className="flex-grow mt-4">
          <textarea
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            className="w-full h-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 font-mono text-sm"
            spellCheck="false"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsonViewer;
