import apiClient from './ApiService';

const ProgressService = {
    // Get user progress
    getUserProgress: async () => {
        try {
            const response = await apiClient.get('/progress');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get progress for a specific course
    getCourseProgress: async (courseId) => {
        try {
            const response = await apiClient.get(`/progress/courses/${courseId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get progress for all courses
    getAllCoursesProgress: async () => {
        try {
            // This endpoint may need to be created on the backend
            const response = await apiClient.get('/progress/courses');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update challenge progress
    updateChallengeProgress: async (challengeId, completed) => {
        try {
            const response = await apiClient.post(`/progress/challenges/${challengeId}`, {
                completed,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reduce hearts (for wrong answers)
    reduceHearts: async (challengeId) => {
        try {
            const response = await apiClient.post(`/progress/hearts/reduce/${challengeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Refill hearts (exchange points for hearts)
    refillHearts: async () => {
        try {
            const response = await apiClient.post('/progress/hearts/refill');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Track when a user views a unit
    trackUnitView: async (courseId, unitId) => {
        try {
            const response = await apiClient.post(`/progress/courses/${courseId}/units/${unitId}/view`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Track when a user starts a lesson
    trackLessonStart: async (courseId, unitId, lessonId) => {
        try {
            const response = await apiClient.post(`/progress/courses/${courseId}/units/${unitId}/lessons/${lessonId}/start`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Track when a user completes a lesson
    trackLessonComplete: async (courseId, unitId, lessonId) => {
        try {
            const response = await apiClient.post(`/progress/courses/${courseId}/units/${unitId}/lessons/${lessonId}/complete`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Track when a user answers a question
    trackQuestionAnswered: async (courseId, unitId, lessonId, questionId, isCorrect) => {
        try {
            const response = await apiClient.post(
                `/progress/courses/${courseId}/units/${unitId}/lessons/${lessonId}/questions/${questionId}/answer`,
                { isCorrect }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default ProgressService;
