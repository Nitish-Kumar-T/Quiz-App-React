import React, { useState, useEffect } from 'react';
import './App.css';

const allQuestions = [
  // ... (previous questions remain the same)
  // Add more questions here for each difficulty level
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
  const [difficulty, setDifficulty] = useState('medium');
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [lifelines, setLifelines] = useState({ fiftyFifty: 1, hintUsed: false });
  const [dynamicDifficulty, setDynamicDifficulty] = useState(0);

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
    setQuestions(shuffleArray(filteredQuestions).slice(0, 10));
    setQuizState('in-progress');
    setTimeLeft(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 240 : 300);
    setLifelines({ fiftyFifty: 1, hintUsed: false });
    setDynamicDifficulty(0);
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
      const difficultyScore = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
      setScore(score + difficultyScore);
      setDynamicDifficulty(dynamicDifficulty + 1);
    } else {
      setDynamicDifficulty(dynamicDifficulty - 1);
    }

    setShowExplanation(true);

    setTimeout(() => {
      setShowExplanation(false);
      setShowHint(false);
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOptions([]);
        adjustDifficulty();
      } else {
        finishQuiz();
      }
    }, 3000);
  };

  const adjustDifficulty = () => {
    if (dynamicDifficulty >= 2) {
      setDifficulty('hard');
    } else if (dynamicDifficulty <= -2) {
      setDifficulty('easy');
    } else {
      setDifficulty('medium');
    }
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
    setDifficulty('medium');
    setUsername('');
    setShowHint(false);
    setLifelines({ fiftyFifty: 1, hintUsed: false });
    setDynamicDifficulty(0);
  };

  const handleOptionSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const useHint = () => {
    setShowHint(true);
    setLifelines({ ...lifelines, hintUsed: true });
  };

  const useFiftyFifty = () => {
    const currentQuestionData = questions[currentQuestion];
    if (currentQuestionData.type === 'multiple-choice') {
      const correctAnswer = currentQuestionData.correctAnswer;
      const wrongOptions = currentQuestionData.options.filter(option => option !== correctAnswer);
      const remainingWrongOption = shuffleArray(wrongOptions)[0];
      const newOptions = shuffleArray([correctAnswer, remainingWrongOption]);
      setQuestions(questions.map((q, index) => 
        index === currentQuestion ? { ...q, options: newOptions } : q
      ));
    }
    setLifelines({ ...lifelines, fiftyFifty: 0 });
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
          <p>Test your knowledge with our 10-question quiz. Select a difficulty level to begin.</p>
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
          <p className="time">Time taken: {(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 240 : 300) - timeLeft} seconds</p>
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
          <div className="lifelines">
            <button onClick={useHint} disabled={lifelines.hintUsed || showExplanation} className="lifeline-btn">
              Use Hint
            </button>
            <button onClick={useFiftyFifty} disabled={lifelines.fiftyFifty === 0 || showExplanation} className="lifeline-btn">
              50/50
            </button>
          </div>
          {showHint && (
            <div className="hint">
              <p><strong>Hint:</strong> {questions[currentQuestion].hint}</p>
            </div>
          )}
          <p className="difficulty-indicator">Current Difficulty: {difficulty}</p>
        </div>
      )}
    </div>
  );
}

export default App;