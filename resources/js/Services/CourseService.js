import apiClient from './ApiService';

const CourseService = {
    // Get all courses
    getCourses: async () => {
        try {
            const response = await apiClient.get('/courses');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get only started courses
    getStartedCourses: async () => {
        try {
            const response = await apiClient.get('/courses/started');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get specific course details
    getCourseById: async (courseId) => {
        try {
            const response = await apiClient.get(`/courses/${courseId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Set active course
    setActiveCourse: async (courseId) => {
        try {
            const response = await apiClient.post(`/courses/${courseId}/active`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get lessons for a unit
    getLessons: async (courseId, unitId) => {
        try {
            // Modify this endpoint based on your API structure
            const response = await apiClient.get(`/courses/${courseId}/units/${unitId}/lessons`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get questions for a lesson
    getQuestions: async (courseId, unitId, lessonId) => {
        try {
            // Modify this endpoint based on your API structure
            const response = await apiClient.get(`/courses/${courseId}/units/${unitId}/lessons/${lessonId}/questions`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default CourseService;
