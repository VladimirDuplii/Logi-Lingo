import React, { useState } from 'react';

const QuestionItem = ({ question, onAnswered }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    if (!question || !question.options) {
        return <div className="error">Question data is missing</div>;
    }

    const handleOptionSelect = (optionId) => {
        if (isSubmitted) return; // Prevent changing after submission
        setSelectedOption(optionId);
    };

    const handleSubmit = () => {
        if (!selectedOption || isSubmitted) return;
        
        // Check if selected option is correct
        const correct = question.options.find(
            option => option.id === selectedOption
        )?.is_correct || false;
        
        setIsCorrect(correct);
        setIsSubmitted(true);
        
        // Delay moving to next question to allow user to see result
        setTimeout(() => {
            if (onAnswered) {
                onAnswered(correct);
            }
            // Reset state for next question
            setSelectedOption(null);
            setIsSubmitted(false);
        }, 1500);
    };

    return (
        <div className="question-item">
            <h3 className="question-text">{question.text}</h3>
            
            {question.image_url && (
                <div className="question-image">
                    <img src={question.image_url} alt="Question illustration" />
                </div>
            )}
            
            <div className="options-list">
                {question.options.map(option => (
                    <div 
                        key={option.id}
                        className={`option-item ${selectedOption === option.id ? 'selected' : ''} ${
                            isSubmitted && option.id === selectedOption 
                                ? (isCorrect ? 'correct' : 'incorrect') 
                                : ''
                        }`}
                        onClick={() => handleOptionSelect(option.id)}
                    >
                        <div className="option-text">{option.text}</div>
                        
                        {option.image_url && (
                            <div className="option-image">
                                <img src={option.image_url} alt="Option illustration" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="question-actions">
                <button 
                    className="btn btn-primary"
                    disabled={!selectedOption || isSubmitted}
                    onClick={handleSubmit}
                >
                    {isSubmitted ? (isCorrect ? 'Correct!' : 'Incorrect!') : 'Check Answer'}
                </button>
            </div>
            
            {isSubmitted && (
                <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
                    {isCorrect 
                        ? 'Great job! That\'s correct.' 
                        : 'Sorry, that\'s not right. The correct answer is: ' + 
                          question.options.find(option => option.is_correct)?.text
                    }
                </div>
            )}
        </div>
    );
};

export default QuestionItem;
