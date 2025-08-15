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
};

export default ProgressService;
