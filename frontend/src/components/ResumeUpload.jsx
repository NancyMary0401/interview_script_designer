import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';
import useQuestionsStore from '../store/questionsStore';
import { useToast } from './ui/use-toast';
import { Loader } from './ui/loader';

const ResumeUpload = () => {
  const generateQuestions = useQuestionsStore(state => state.generateQuestions);
  const loading = useQuestionsStore(state => state.loading);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      await generateQuestions(file);
      toast({
        title: "Success!",
        description: "New interview questions have been generated.",
      });
    }
  }, [generateQuestions, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
          ${isDragActive
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-2xl shadow-purple-500/25'
            : 'bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100'
          }`}
      >
        <input {...getInputProps()} />

        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/20 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative p-12 md:p-16">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Icon with animated background */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                ${isDragActive
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg'
                }`}>
                {loading ? (
                  <Loader className="w-10 h-10 text-white" size="xl" />
                ) : (
                  <UploadCloud className={`w-10 h-10 transition-colors duration-300
                    ${isDragActive ? 'text-white' : 'text-white'}`} />
                )}
              </div>

              {/* Pulsing ring animation */}
              {!loading && (
                <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-20"></div>
              )}
            </div>

            {/* Main content */}
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-purple-900">Generating Questions...</h3>
                  <p className="text-purple-700">Analyzing your resume and creating tailored interview questions</p>
                </div>
              ) : (
                <>
                  <h3 className={`text-2xl font-bold transition-colors duration-300
                    ${isDragActive ? 'text-white' : 'text-purple-900'}`}>
                    {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                  </h3>
                  <p className={`text-lg transition-colors duration-300 max-w-md
                    ${isDragActive ? 'text-purple-100' : 'text-purple-700'}`}>
                    {isDragActive
                      ? 'Release to upload your resume'
                      : 'Drag & drop your resume here, or click to browse'}
                  </p>
                </>
              )}
            </div>

            {/* File type indicators */}
            {!loading && (
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors duration-300
                  ${isDragActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors duration-300
                  ${isDragActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  <FileText className="w-4 h-4" />
                  <span>DOCX</span>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors duration-300
                  ${isDragActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  <FileText className="w-4 h-4" />
                  <span>TXT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
