// Unit tests for key functions

// Mock DOM elements for testing
document.body.innerHTML = `
  <div id="quizIntro"></div>
  <div id="quizSection" style="display: none;"></div>
  <div id="quizResults" style="display: none;"></div>
  <div id="answersReview" style="display: none;"></div>
  <div id="quizContainer"></div>
  <div id="progressFill"></div>
  <div id="progressText"></div>
  <button id="prevBtn"></button>
  <button id="nextBtn"></button>
  <div id="funFact" style="display: none;"></div>
  <div id="factText"></div>
`;

// Import the QuizManager (assuming it's loaded)
describe('QuizManager', () => {
  let quiz;

  beforeEach(() => {
    quiz = new QuizManager();
  });

  test('should initialize with correct default values', () => {
    expect(quiz.currentQuestion).toBe(0);
    expect(quiz.userAnswers).toEqual([]);
    expect(quiz.matchingAnswers).toEqual({});
  });

  test('should have quiz data', () => {
    expect(quiz.quizData).toBeDefined();
    expect(quiz.quizData.length).toBeGreaterThan(0);
  });

  test('should check single choice answer correctly', () => {
    const question = { type: 'single', correct: 1 };
    expect(quiz.checkAnswer(question, 1)).toBe(true);
    expect(quiz.checkAnswer(question, 0)).toBe(false);
  });

  test('should check matching answer correctly', () => {
    const question = {
      type: 'matching',
      pairs: [
        { left: 'A', right: '1' },
        { left: 'B', right: '2' }
      ]
    };
    const correctAnswer = [
      { left: 'A', right: '1' },
      { left: 'B', right: '2' }
    ];
    expect(quiz.checkAnswer(question, correctAnswer)).toBe(true);
  });
});

describe('Utility Functions', () => {
  test('debounce should delay function execution', (done) => {
    let called = false;
    const debounced = debounce(() => called = true, 100);

    debounced();
    expect(called).toBe(false);

    setTimeout(() => {
      expect(called).toBe(true);
      done();
    }, 150);
  });

  test('throttle should limit function calls', () => {
    let count = 0;
    const throttled = throttle(() => count++, 100);

    throttled();
    throttled();
    throttled();

    expect(count).toBe(1);
  });
});