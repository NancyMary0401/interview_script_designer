import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import useQuestionsStore from '../store/questionsStore';
import { useToast } from './ui/use-toast';

const JsonViewer = ({ children }) => {
  const questions = useQuestionsStore(state => state.questions);
  const [jsonString, setJsonString] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setJsonString(JSON.stringify(questions, null, 2));
  }, [questions]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      toast({
        title: 'Copied!',
        description: 'JSON content has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
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
          <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JsonViewer;
