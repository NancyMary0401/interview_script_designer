import { create } from 'zustand';
import axios from 'axios';

// Define the API base URL
const API_URL = 'http://localhost:8000/api/v1';

const useQuestionsStore = create((set, get) => ({
  questions: [],
  resumeText: "", // Store the original resume text
  loading: false,
  error: null,

  // Action to generate questions from a resume
  generateQuestions: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      // First upload and parse the resume to get the text
      const uploadResponse = await axios.post(`${API_URL}/upload-resume/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const resumeText = uploadResponse.data.resume_text;
      set({ resumeText }); // Store the resume text

      // Then generate questions using the same file with specified parameters
      const generateResponse = await axios.post(`${API_URL}/generate-questions/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'num_questions': '10',
          'depth': '0',  // No depth for initial questions
          'breadth': 'Low',  // Low breadth by default
          'persona': 'Why-How'
        },
      });

      set({ questions: generateResponse.data.data.questions, loading: false });
    } catch (error) {
      console.error('Error generating questions:', error);
      set({ error: 'Failed to generate questions.', loading: false });
    }
  },

  // Action to update a single question (e.g., for regenerating follow-ups)
  updateQuestion: async (questionId, updatedFields) => {
    console.log('DEBUG: updateQuestion called with:', { questionId, updatedFields });
    
    const currentQuestions = get().questions;
    const resumeText = get().resumeText; // Get the stored resume text
    const originalQuestion = currentQuestions.find(q => q.id === questionId);
    
    console.log('DEBUG: Original question controls:', originalQuestion?.controls);

    // Optimistic update
    const updatedQuestions = currentQuestions.map(q =>
      q.id === questionId ? { ...q, ...updatedFields } : q
    );
    set({ questions: updatedQuestions });

    try {
      // Create a clean question object with only the necessary fields
      const cleanQuestion = {
        id: originalQuestion.id,
        claim: originalQuestion.claim,
        main_question: originalQuestion.main_question,
        controls: { ...originalQuestion.controls },
        follow_ups: originalQuestion.follow_ups ? [...originalQuestion.follow_ups] : []
      };

      // Prepare the request data with only the necessary fields
      const requestData = {
        resume_text: resumeText,
        question: cleanQuestion,
        ...(updatedFields.breadth !== undefined && { breadth: updatedFields.breadth }),
        ...(updatedFields.depth !== undefined && { depth: updatedFields.depth }),
        ...(updatedFields.persona !== undefined && { persona: updatedFields.persona }),
        ...(updatedFields.regenerate_followups !== undefined && { regenerate_followups: updatedFields.regenerate_followups })
      };

      console.log('DEBUG: Request data being sent:', requestData);

      const response = await axios.post(`${API_URL}/update-question/`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Replace the optimistically updated question with the actual response
      // The backend returns {status: "success", data: updated_question}
      const updatedQuestion = response.data.data;

      // Validate that we got a proper question object
      if (!updatedQuestion || typeof updatedQuestion !== 'object' || !updatedQuestion.id) {
        throw new Error('Invalid response format from server');
      }

      set(state => ({
        questions: state.questions.map(q => q.id === questionId ? updatedQuestion : q)
      }));
    } catch (error) {
      console.error('Error updating question:', error);
      // Rollback on error
      set({ questions: currentQuestions, error: 'Failed to update question.' });
    }
  },

  // Action to update the local state of a question without an API call (for text edits, sliders, etc.)
  updateLocalQuestion: (questionId, updatedFields) => {
    set(state => ({
      questions: state.questions.map(q => 
        q.id === questionId ? { ...q, ...updatedFields } : q
      )
    }));
  },

  // Action to save the entire script
  saveScript: async () => {
    set({ loading: true, error: null });
    try {
      const script = get().questions;
      await axios.post(`${API_URL}/save-script/`, { questions: script });
      set({ loading: false });
      // Optionally, show a success message to the user
    } catch (error) {
      console.error('Error saving script:', error);
      set({ error: 'Failed to save the script.', loading: false });
    }
  },
}));

export default useQuestionsStore;
