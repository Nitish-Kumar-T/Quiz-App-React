import React, { useState, useEffect } from 'react';
import './App.css';
// import confetti from 'canvas-confetti';

const allQuestions = [
  // Easy questions
  {
    id: 1,
    type: "multiple-choice",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital and most populous city of France.",
    difficulty: "easy"
  },
  {
    id: 2,
    type: "true-false",
    question: "The Earth is flat.",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "The Earth is actually an oblate spheroid, slightly flattened at the poles.",
    difficulty: "easy"
  },
  // Medium questions
  {
    id: 3,
    type: "multiple-choice",
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Jupiter", "Venus", "Saturn"],
    correctAnswer: "Mars",
    explanation: "Mars is often called the Red Planet due to its reddish appearance in the night sky.",
    difficulty: "medium"
  },
  {
    id: 4,
    type: "short-answer",
    question: "What is the chemical symbol for water?",
    correctAnswer: "H2O",
    explanation: "H2O represents two hydrogen atoms and one oxygen atom bonded together.",
    difficulty: "medium"
  },
  // Hard questions
  {
    id: 5,
    type: "multiple-select",
    question: "Which of the following are prime numbers?",
    options: ["2", "4", "7", "9", "11"],
    correctAnswer: ["2", "7", "11"],
    explanation: "Prime numbers are numbers that have exactly two factors: 1 and themselves.",
    difficulty: "hard"
  },
  {
    id: 6,
    type: "multiple-choice",
    question: "What is the half-life of Carbon-14?",
    options: ["2,730 years", "5,730 years", "7,730 years", "10,730 years"],
    correctAnswer: "5,730 years",
    explanation: "The half-life of Carbon-14 is approximately 5,730 years, which makes it useful for dating objects up to about 50,000 years old.",
    difficulty: "hard"
  },
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);
  const [quizState, setQuizState] = useState('not-started');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (quizState === 'in-progress' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, quizState]);

  const startQuiz = () => {
    const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    setQuestions(shuffleArray(filteredQuestions).slice(0, 5));
    setQuizState('in-progress');
    setTimeLeft(difficulty === 'easy' ? 120 : difficulty === 'medium' ? 180 : 240);
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
      setScore(score + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3));
    }

    setShowExplanation(true);

    setTimeout(() => {
      setShowExplanation(false);
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOptions([]);
      } else {
        finishQuiz();
      }
    }, 3000);
  };

  const finishQuiz = () => {
    setShowScore(true);
    setQuizState('finished');
    if (score / (questions.length * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3)) >= 0.7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    updateLeaderboard();
  };

  const updateLeaderboard = () => {
    const newLeaderboard = [...leaderboard, { username, score, difficulty }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(newLeaderboard);
    localStorage.setItem('quizLeaderboard', JSON.stringify(newLeaderboard));
  };

  const restartQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswers({});
    setTimeLeft(0);
    setQuizState('not-started');
    setSelectedOptions([]);
    setShowExplanation(false);
    setDifficulty('');
    setUsername('');
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
              <button key={index} onClick={() => handleAnswerSubmit(option)} className="option-btn" disabled={showExplanation}>
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
            <input type="text" name="answer" required className="short-answer-input" disabled={showExplanation} />
            <button type="submit" className="submit-btn" disabled={showExplanation}>Submit</button>
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
                disabled={showExplanation}
              >
                {option}
              </button>
            ))}
            <button onClick={() => handleAnswerSubmit(selectedOptions)} className="submit-btn" disabled={showExplanation}>Submit</button>
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

  const renderLeaderboard = () => {
    return (
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{entry.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (quizState === 'not-started') {
    return (
      <div className="App">
        <div className="quiz-card start-screen">
          <h1>Welcome to the Quiz!</h1>
          <p>Test your knowledge with our 5-question quiz. Select a difficulty level to begin.</p>
          <input 
            type="text" 
            placeholder="Enter your username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
          />
          <div className="difficulty-selection">
            <button onClick={() => setDifficulty('easy')} className={`difficulty-btn ${difficulty === 'easy' ? 'selected' : ''}`}>Easy</button>
            <button onClick={() => setDifficulty('medium')} className={`difficulty-btn ${difficulty === 'medium' ? 'selected' : ''}`}>Medium</button>
            <button onClick={() => setDifficulty('hard')} className={`difficulty-btn ${difficulty === 'hard' ? 'selected' : ''}`}>Hard</button>
          </div>
          <button onClick={startQuiz} className="start-btn" disabled={!difficulty || !username}>Start Quiz</button>
          {renderLeaderboard()}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {showScore ? (
        <div className="quiz-card score-section">
          <h2>Quiz Completed!</h2>
          <p className="score">You scored {score} out of {questions.length * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3)}</p>
          <p className="time">Time taken: {(difficulty === 'easy' ? 120 : difficulty === 'medium' ? 180 : 240) - timeLeft} seconds</p>
          {renderReview()}
          {renderLeaderboard()}
          <button onClick={restartQuiz} className="restart-btn">Restart Quiz</button>
        </div>
      ) : (
        <div className="quiz-card question-section">
          <div className="quiz-header">
            <h2>Question {currentQuestion + 1}/{questions.length}</h2>
            <p className="timer">Time left: {timeLeft} seconds</p>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${(currentQuestion / questions.length) * 100}%` }}></div>
          </div>
          <p className="question">{questions[currentQuestion].question}</p>
          {renderQuestion()}
          {showExplanation && (
            <div className={`explanation ${answers[questions[currentQuestion].id]?.isCorrect ? 'correct' : 'incorrect'}`}>
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;