import React, { useState, useEffect } from 'react';
import './App.css';

const questions = [
  {
    id: 1,
    type: "multiple-choice",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    id: 2,
    type: "true-false",
    question: "The Earth is flat.",
    options: ["True", "False"],
    correctAnswer: "False"
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Jupiter", "Venus", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    id: 4,
    type: "short-answer",
    question: "What is the chemical symbol for water?",
    correctAnswer: "H2O"
  }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizState, setQuizState] = useState('not-started');

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
    setTimeLeft(60);
  };

  const handleAnswerSubmit = (selectedAnswer) => {
    const currentQuestionData = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQuestionData.correctAnswer;
    
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
    setTimeLeft(60);
    setQuizState('not-started');
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return (
          <div className="answer-options">
            {question.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswerSubmit(option)}>
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
          }}>
            <input type="text" name="answer" required />
            <button type="submit">Submit</button>
          </form>
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
            <p>Q{index + 1}: {question.question}</p>
            <p>Your answer: {answers[question.id]?.selectedAnswer || 'Not answered'}</p>
            <p>Correct answer: {question.correctAnswer}</p>
            <p>{answers[question.id]?.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
          </div>
        ))}
      </div>
    );
  };

  if (quizState === 'not-started') {
    return (
      <div className="App">
        <h1>Welcome to the Quiz!</h1>
        <button onClick={startQuiz}>Start Quiz</button>
      </div>
    );
  }

  return (
    <div className="App">
      {showScore ? (
        <div className="score-section">
          <h2>You scored {score} out of {questions.length}</h2>
          <p>Time taken: {60 - timeLeft} seconds</p>
          {renderReview()}
          <button onClick={restartQuiz}>Restart Quiz</button>
        </div>
      ) : (
        <div className="question-section">
          <div className="quiz-header">
            <h2>Question {currentQuestion + 1}/{questions.length}</h2>
            <p>Time left: {timeLeft} seconds</p>
          </div>
          <p>{questions[currentQuestion].question}</p>
          {renderQuestion()}
        </div>
      )}
    </div>
  );
}

export default App;