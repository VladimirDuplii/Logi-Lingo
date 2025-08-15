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
};

export default CourseService;
