import React, { useState, useEffect } from 'react';
import './App.css';

const questions = [
  {
    id: 1,
    type: "multiple-choice",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital and most populous city of France."
  },
  {
    id: 2,
    type: "true-false",
    question: "The Earth is flat.",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "The Earth is actually an oblate spheroid, slightly flattened at the poles."
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Jupiter", "Venus", "Saturn"],
    correctAnswer: "Mars",
    explanation: "Mars is often called the Red Planet due to its reddish appearance in the night sky."
  },
  {
    id: 4,
    type: "short-answer",
    question: "What is the chemical symbol for water?",
    correctAnswer: "H2O",
    explanation: "H2O represents two hydrogen atoms and one oxygen atom bonded together."
  },
  {
    id: 5,
    type: "multiple-select",
    question: "Which of the following are prime numbers?",
    options: ["2", "4", "7", "9", "11"],
    correctAnswer: ["2", "7", "11"],
    explanation: "Prime numbers are numbers that have exactly two factors: 1 and themselves."
  }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);
  const [quizState, setQuizState] = useState('not-started');
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (quizState === 'in-progress' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, quizState]);

  const startQuiz = () => {
    setQuizState('in-progress');
    setTimeLeft(120);
  };

  const handleAnswerSubmit = (selectedAnswer) => {
    const currentQuestionData = questions[currentQuestion];
    let isCorrect = false;

    if (currentQuestionData.type === 'multiple-select') {
      isCorrect = JSON.stringify(selectedOptions.sort()) === JSON.stringify(currentQuestionData.correctAnswer.sort());
      selectedAnswer = selectedOptions;
    } else {
      isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    }
    
    setAnswers({
      ...answers,
      [currentQuestionData.id]: { selectedAnswer, isCorrect }
    });

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOptions([]);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setShowScore(true);
    setQuizState('finished');
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswers({});
    setTimeLeft(120);
    setQuizState('not-started');
    setSelectedOptions([]);
  };

  const handleOptionSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return (
          <div className="answer-options">
            {question.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswerSubmit(option)} className="option-btn">
                {option}
              </button>
            ))}
          </div>
        );
      case 'short-answer':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAnswerSubmit(e.target.answer.value);
          }} className="short-answer-form">
            <input type="text" name="answer" required className="short-answer-input" />
            <button type="submit" className="submit-btn">Submit</button>
          </form>
        );
      case 'multiple-select':
        return (
          <div className="answer-options">
            {question.options.map((option, index) => (
              <button 
                key={index} 
                onClick={() => handleOptionSelect(option)}
                className={`option-btn ${selectedOptions.includes(option) ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
            <button onClick={() => handleAnswerSubmit(selectedOptions)} className="submit-btn">Submit</button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderReview = () => {
    return (
      <div className="review-section">
        <h2>Review Your Answers</h2>
        {questions.map((question, index) => (
          <div key={question.id} className="review-question">
            <h3>Q{index + 1}: {question.question}</h3>
            <p><strong>Your answer:</strong> {Array.isArray(answers[question.id]?.selectedAnswer) 
              ? answers[question.id]?.selectedAnswer.join(', ') 
              : answers[question.id]?.selectedAnswer || 'Not answered'}</p>
            <p><strong>Correct answer:</strong> {Array.isArray(question.correctAnswer) 
              ? question.correctAnswer.join(', ') 
              : question.correctAnswer}</p>
            <p className={answers[question.id]?.isCorrect ? 'correct' : 'incorrect'}>
              {answers[question.id]?.isCorrect ? '✅ Correct' : '❌ Incorrect'}
            </p>
            <p><strong>Explanation:</strong> {question.explanation}</p>
          </div>
        ))}
      </div>
    );
  };

  if (quizState === 'not-started') {
    return (
      <div className="App">
        <div className="quiz-card start-screen">
          <h1>Welcome to the Quiz!</h1>
          <p>Test your knowledge with our 5-question quiz. You have 2 minutes to complete all questions. Good luck!</p>
          <button onClick={startQuiz} className="start-btn">Start Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {showScore ? (
        <div className="quiz-card score-section">
          <h2>Quiz Completed!</h2>
          <p className="score">You scored {score} out of {questions.length}</p>
          <p className="time">Time taken: {120 - timeLeft} seconds</p>
          {renderReview()}
          <button onClick={restartQuiz} className="restart-btn">Restart Quiz</button>
        </div>
      ) : (
        <div className="quiz-card question-section">
          <div className="quiz-header">
            <h2>Question {currentQuestion + 1}/{questions.length}</h2>
            <p className="timer">Time left: {timeLeft} seconds</p>
          </div>
          <p className="question">{questions[currentQuestion].question}</p>
          {renderQuestion()}
        </div>
      )}
    </div>
  );
}

export default App;