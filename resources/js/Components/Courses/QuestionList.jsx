import React, { useState, useEffect } from 'react';
import { CourseService, ProgressService } from '../../Services';
import QuestionItem from './QuestionItem';

const QuestionList = ({ courseId, unitId, lessonId }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!courseId || !unitId || !lessonId) return;
            
            try {
                const response = await CourseService.getQuestions(courseId, unitId, lessonId);
                setQuestions(response.data.data || []);
            } catch (err) {
                setError('Failed to load questions. Please try again later.');
                console.error('Error fetching questions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
        setCurrentIndex(0);
        setCompleted(false);
    }, [courseId, unitId, lessonId]);

    const handleQuestionAnswered = async (questionId, isCorrect) => {
        // Track question answered
        try {
            await ProgressService.trackQuestionAnswered(
                courseId, 
                unitId, 
                lessonId,
                questionId,
                isCorrect
            );
        } catch (error) {
            console.error('Error tracking question answered:', error);
        }

        // Move to next question
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1);
        } else {
            // All questions completed
            setCompleted(true);
            
            // Track lesson completion
            try {
                await ProgressService.trackLessonComplete(courseId, unitId, lessonId);
            } catch (error) {
                console.error('Error tracking lesson completion:', error);
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading questions...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (questions.length === 0) {
        return <div className="no-questions">No questions available for this lesson.</div>;
    }

    if (completed) {
        return (
            <div className="lesson-completed">
                <h2>Lesson Completed!</h2>
                <p>Congratulations on completing this lesson.</p>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setCurrentIndex(0);
                        setCompleted(false);
                    }}
                >
                    Restart Lesson
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    
    return (
        <div className="question-container">
            <div className="question-progress">
                Question {currentIndex + 1} of {questions.length}
            </div>
            
            <QuestionItem 
                question={currentQuestion}
                onAnswered={(isCorrect) => handleQuestionAnswered(currentQuestion.id, isCorrect)}
            />
        </div>
    );
};

export default QuestionList;
