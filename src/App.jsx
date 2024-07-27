import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const allQuestions = [
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
    question: "Which element has the chemical symbol 'Au'?",
    options: ["Silver", "Gold", "Copper", "Aluminum"],
    correctAnswer: "Gold",
    explanation: "The chemical symbol 'Au' comes from the Latin word for gold, 'aurum'.",
    difficulty: "hard"
  },
  {
    id: 7,
    type: "true-false",
    question: "The Great Wall of China is visible from space.",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Contrary to popular belief, the Great Wall of China is not visible from space with the naked eye.",
    difficulty: "easy"
  },
  {
    id: 8,
    type: "multiple-select",
    question: "Which of these countries are in South America?",
    options: ["Brazil", "Spain", "Peru", "Egypt", "Argentina"],
    correctAnswer: ["Brazil", "Peru", "Argentina"],
    explanation: "Brazil, Peru, and Argentina are all countries located in South America.",
    difficulty: "medium"
  },
  {
    id: 9,
    type: "multiple-choice",
    question: "What is the half-life of Carbon-14?",
    options: ["2,730 years", "5,730 years", "7,730 years", "10,730 years"],
    correctAnswer: "5,730 years",
    explanation: "The half-life of Carbon-14 is approximately 5,730 years, which makes it useful for dating objects up to about 50,000 years old.",
    difficulty: "hard"
  }
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
  const [lifelines, setLifelines] = useState({ fiftyFifty: 1, hintUsed: false, skipQuestion: 1 });
  const [dynamicDifficulty, setDynamicDifficulty] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [quizHistory, setQuizHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (quizState === 'in-progress' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, quizState]);

  useEffect(() => {
    const storedLeaderboard = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
    setLeaderboard(storedLeaderboard);

    const storedHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    setQuizHistory(storedHistory);

    const storedAchievements = JSON.parse(localStorage.getItem('quizAchievements')) || [];
    setAchievements(storedAchievements);
  }, []);

  const startQuiz = () => {
    const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    setQuestions(shuffleArray(filteredQuestions).slice(0, 10));
    setQuizState('in-progress');
    setTimeLeft(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 240 : 300);
    setLifelines({ fiftyFifty: 1, hintUsed: false, skipQuestion: 1 });
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
      const newStreak = streak + 1;
      setStreak(newStreak);
      setHighestStreak(Math.max(highestStreak, newStreak));
      checkStreakAchievements(newStreak);
    } else {
      setDynamicDifficulty(dynamicDifficulty - 1);
      setStreak(0);
    }

    setFeedbackMessage(isCorrect ? 'Great job!' : 'Oops! Try again next time.');
    setShowFeedback(true);
    setShowExplanation(true);

    setTimeout(() => {
      setShowExplanation(false);
      setShowHint(false);
      setShowFeedback(false);
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

  const finishQuiz = useCallback(() => {
    setShowScore(true);
    setQuizState('finished');
    updateLeaderboard();
    updateQuizHistory();
    updateCategoryStats();
    checkCompletionAchievements();
  }, [score, questions, difficulty]);

  const updateLeaderboard = () => {
    const newLeaderboard = [...leaderboard, { username, score, difficulty }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(newLeaderboard);
    localStorage.setItem('quizLeaderboard', JSON.stringify(newLeaderboard));
  };

  const updateQuizHistory = () => {
    const newQuizResult = {
      date: new Date().toISOString(),
      score,
      difficulty,
      questionsAnswered: questions.length,
      timeRemaining: timeLeft
    };
    const updatedHistory = [...quizHistory, newQuizResult];
    setQuizHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
  };

  const updateCategoryStats = () => {
    const newCategoryStats = { ...categoryStats };
    questions.forEach((question, index) => {
      const category = question.category;
      if (!newCategoryStats[category]) {
        newCategoryStats[category] = { correct: 0, total: 0 };
      }
      newCategoryStats[category].total++;
      if (answers[question.id]?.isCorrect) {
        newCategoryStats[category].correct++;
      }
    });
    setCategoryStats(newCategoryStats);
  };

  const checkStreakAchievements = (newStreak) => {
    const streakAchievements = [
      { id: 'streak5', name: 'On Fire!', description: 'Answer 5 questions correctly in a row', threshold: 5 },
      { id: 'streak10', name: 'Unstoppable!', description: 'Answer 10 questions correctly in a row', threshold: 10 },
    ];

    streakAchievements.forEach(achievement => {
      if (newStreak >= achievement.threshold && !achievements.some(a => a.id === achievement.id)) {
        const newAchievements = [...achievements, achievement];
        setAchievements(newAchievements);
        localStorage.setItem('quizAchievements', JSON.stringify(newAchievements));
        setShowAchievements(true);
      }
    });
  };

  const checkCompletionAchievements = () => {
    const completionAchievements = [
      { id: 'complete1', name: 'Quiz Novice', description: 'Complete your first quiz', threshold: 1 },
      { id: 'complete5', name: 'Quiz Enthusiast', description: 'Complete 5 quizzes', threshold: 5 },
    ];

    const quizCount = quizHistory.length + 1;

    completionAchievements.forEach(achievement => {
      if (quizCount >= achievement.threshold && !achievements.some(a => a.id === achievement.id)) {
        const newAchievements = [...achievements, achievement];
        setAchievements(newAchievements);
        localStorage.setItem('quizAchievements', JSON.stringify(newAchievements));
        setShowAchievements(true);
      }
    });
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
    setLifelines({ fiftyFifty: 1, hintUsed: false, skipQuestion: 1 });
    setDynamicDifficulty(0);
    setStreak(0);
    setShowFeedback(false);
    setShowStats(false);
    setShowAchievements(false);
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

  const useSkipQuestion = () => {
    if (lifelines.skipQuestion > 0) {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOptions([]);
        setShowHint(false);
        setShowExplanation(false);
        setLifelines({ ...lifelines, skipQuestion: lifelines.skipQuestion - 1 });
      }
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