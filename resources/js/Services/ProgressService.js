import apiClient from "./ApiService";

const ProgressService = {
    // No-op helpers for UI tracking (avoid console errors in components)
    trackUnitView: async (_courseId, _unitId) => Promise.resolve(),
    trackLessonStart: async (_courseId, _unitId, _lessonId) => Promise.resolve(),
    trackLessonComplete: async (_courseId, _unitId, _lessonId) => Promise.resolve(),
    completeLesson: async (lessonId, correct, total) => {
        try {
            const response = await apiClient.post(`/progress/lessons/${lessonId}/complete`, { correct, total });
            return response.data;
        } catch (error) {
            console.error(`Error completing lesson ${lessonId}:`, error);
            throw error;
        }
    },
    trackQuestionAnswered: async (courseId, unitId, lessonId, challengeId, isCorrect) => {
        try {
            // Update challenge progress
            await ProgressService.updateChallengeProgress(challengeId, isCorrect);
            if (!isCorrect) {
                await ProgressService.reduceHearts(challengeId);
            }
        } catch (e) {
            // best-effort; surface in console for debugging
            console.error('trackQuestionAnswered failed', { courseId, unitId, lessonId, challengeId, isCorrect }, e);
        }
    },
    // Get user progress
    getUserProgress: async () => {
        try {
            const response = await apiClient.get("/progress");
            return response.data;
        } catch (error) {
            console.error("Error fetching user progress:", error);
            throw error;
        }
    },

    // Get course progress
    getCourseProgress: async (courseId) => {
        try {
            const response = await apiClient.get(`/progress/courses/${courseId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching course progress for course ${courseId}:`, error);
            throw error;
        }
    },

    // Get progress for all courses
    getAllCoursesProgress: async () => {
        try {
            // This is a method that needs to be implemented on the backend
            // For now, we"ll simulate it by getting user progress and then fetching each active course"s progress
            const userProgressResponse = await ProgressService.getUserProgress();
            
            // If there are no active courses, return empty array
            if (!userProgressResponse.data || !userProgressResponse.data.active_course_id) {
                return { data: { data: [] } };
            }
            
            // Get progress for the active course
            const courseProgressResponse = await ProgressService.getCourseProgress(userProgressResponse.data.active_course_id);
            
            // Format the response to match what the components expect
            return { 
                data: { 
                    data: [
                        {
                            course_id: userProgressResponse.data.active_course_id,
                            course_title: userProgressResponse.data.active_course ? userProgressResponse.data.active_course.title : "Unknown Course",
                            course_description: "Course description",
                            completion_percentage: 0, // This would need to be calculated based on the course progress
                            completed_units: 0,
                            total_units: courseProgressResponse.data.length || 0,
                            completed_lessons: 0,
                            total_lessons: courseProgressResponse.data.reduce((total, unit) => total + unit.lessons.length, 0),
                            total_questions_answered: 0,
                            correct_answers_count: 0,
                            correct_answers_percentage: 0,
                            last_activity_date: new Date().getTime()
                        }
                    ] 
                } 
            };
        } catch (error) {
            console.error("Error fetching all courses progress:", error);
            throw error;
        }
    },

    // Update challenge progress
    updateChallengeProgress: async (challengeId, completed) => {
        try {
            const response = await apiClient.post(`/progress/challenges/${challengeId}`, { completed });
            return response.data;
        } catch (error) {
            console.error(`Error updating challenge progress for challenge ${challengeId}:`, error);
            throw error;
        }
    },

    // Reduce hearts for a challenge
    reduceHearts: async (challengeId) => {
        try {
            const response = await apiClient.post(`/progress/hearts/reduce/${challengeId}`);
            return response.data;
        } catch (error) {
            console.error("Error reducing hearts:", error);
            throw error;
        }
    },

    // Refill hearts using points
    refillHearts: async () => {
        try {
            const response = await apiClient.post("/progress/hearts/refill");
            return response.data;
        } catch (error) {
            console.error("Error refilling hearts:", error);
            throw error;
        }
    },

    // Refill hearts using gems
    refillHeartsWithGems: async () => {
        try {
            const response = await apiClient.post('/progress/hearts/refill-with-gems');
            return response.data;
        } catch (error) {
            console.error('Error refilling hearts with gems:', error);
            throw error;
        }
    },

    // Daily quests summary
    getDailyQuests: async () => {
        try {
            const response = await apiClient.get('/progress/daily');
            return response.data;
        } catch (error) {
            console.error('Error fetching daily quests:', error);
            throw error;
        }
    },

    // Update daily XP goal
    updateDailyGoal: async (dailyGoalXp) => {
        try {
            const response = await apiClient.post('/progress/daily-goal', { daily_goal_xp: dailyGoalXp });
            return response.data;
        } catch (error) {
            console.error('Error updating daily goal:', error);
            throw error;
        }
    }
};

export default ProgressService;
