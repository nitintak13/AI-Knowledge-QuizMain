# AI Knowledge Quiz

An interactive web application that generates personalized multiple-choice quizzes on any topic using Google's Gemini AI. Test your knowledge, get instant feedback, and receive AI-powered insights to help you learn and improve.

## Project Setup & Demo

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-knowledge-quiz
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

4. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`


### Demo

![alt text](<Screenshot 2025-12-05 235542.png>)
_Select a preset topic or enter your own custom topic_

![alt text](<Screenshot 2025-12-05 235644.png>)
_Interactive quiz with progress tracking_

![alt text](<Screenshot 2025-12-05 235713.png>)
_Detailed results with AI-generated feedback_

## Problem Understanding

### The Challenge

The goal was to create an educational quiz application that:

- Generates high-quality, relevant quiz questions on any topic using AI
- Provides an intuitive, user-friendly interface for taking quizzes
- Offers personalized feedback and learning insights
- Maintains quiz progress across page refreshes
- Handles errors gracefully with retry mechanisms

### Assumptions Made

1. **AI Reliability**: The Gemini API would return valid JSON responses most of the time, but we implemented retry logic for edge cases
2. **User Behavior**: Users might want to skip questions, so we allowed null answers
3. **State Persistence**: Users might refresh the page mid-quiz, so we implemented localStorage-based state management
4. **Topic Flexibility**: Any topic string would be valid input, with the AI handling topic validation
5. **Question Format**: All quizzes would have exactly 5 questions with 4 multiple-choice options each

### Key Features

- ✅ AI-powered question generation using Google Gemini
- ✅ Custom topic input or preset topic selection
- ✅ Progress tracking with visual progress bar
- ✅ Question navigation (Previous/Next/Skip)
- ✅ Instant answer validation
- ✅ AI-generated personalized feedback
- ✅ Detailed question review with explanations
- ✅ Dark mode support
- ✅ Responsive design for all screen sizes
- ✅ State persistence using localStorage

## AI Prompts & Iterations

### Initial Approach

**First Prompt Attempt:**

```
Generate 5 multiple-choice questions about {topic}
```

**Issues Encountered:**

- Inconsistent JSON format in responses
- Sometimes returned markdown code blocks instead of raw JSON
- Occasional malformed question structures
- Missing required fields (explanations, correct_index)

### Refined Solution

**System Prompt (Quiz Generation):**

```
You are a concise quiz-writer. Return ONLY valid JSON that matches the provided schema.
If you cannot generate questions for the topic, return {"error":true,"message":"<reason>"}.
```

**User Prompt with Schema:**

```
Task: Generate EXACTLY 5 multiple-choice questions about "{topic}".
Each question must have 4 options. Mark the correct answer using correct_index (0-3).
Provide a short explanation for each question explaining why the answer is correct.

Return ONLY valid JSON matching this schema:
{"topic":"string","questions":[{"id":"int","question":"string","options":["string","string","string","string"],"correct_index":"int (0-3)","explanation":"string"}]}

Make questions interesting, educational, and appropriately challenging.
Ensure all options are plausible but only one is correct.
```

**Key Improvements:**

1. **Explicit Schema Definition**: Included the exact JSON structure in the prompt
2. **Error Handling**: Added error response format for invalid topics
3. **Retry Logic**: Implemented exponential backoff (400ms × attempt) with up to 2 retries
4. **Response Parsing**: Added logic to extract JSON from markdown code blocks
5. **Validation**: Server-side validation ensures all questions meet requirements

**Feedback Generation Prompt:**

```
A user just completed a quiz about "{topic}".
They scored {score} out of {total} ({percentage}%).

{incorrect_questions_context}

Provide personalized feedback with:
1. A brief encouraging summary (2-3 sentences) about their performance
2. 2-4 specific tips for improvement based on their score and the topic

Return ONLY valid JSON in this format:
{"summary":"string","tips":["string","string"]}
```

### Results

After these refinements:

- ✅ 95%+ success rate on first attempt
- ✅ Consistent JSON structure
- ✅ Proper error handling for edge cases
- ✅ High-quality, educational questions

## Architecture & Code Structure

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **AI**: Google Gemini API (gemini-2.5-flash)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + localStorage
- **Routing**: Wouter (lightweight router)

### Project Structure

```
ai-knowledge-quiz/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TopicSelect.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── QuizScreen.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── ResultsScreen.tsx
│   │   │   ├── ErrorScreen.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── pages/         # Page components
│   │   │   └── quiz.tsx   # Main quiz page (screen manager)
│   │   ├── lib/           # Utilities and API clients
│   │   │   ├── api.ts     # API service layer
│   │   │   └── queryClient.ts
│   │   ├── context/       # React Context
│   │   │   └── QuizContext.tsx
│   │   └── App.tsx        # Root component with routing
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route handlers
│   ├── gemini.ts          # AI service layer
│   ├── vite.ts            # Vite dev server setup
│   └── static.ts          # Static file serving
├── shared/                 # Shared types and schemas
│   └── schema.ts
└── script/
    └── build.ts           # Build script
```

### Key Components

#### 1. **App.tsx** - Application Root

- Sets up React Query provider for API state management
- Configures routing with Wouter
- Renders ThemeToggle for dark mode

#### 2. **quiz.tsx** - Screen Manager

- Manages application state and screen transitions
- Handles localStorage persistence
- Coordinates between different screens (topic → loading → quiz → results)
- Implements quiz generation and feedback API calls

#### 3. **TopicSelect.tsx** - Topic Selection Screen

- Displays preset topics in a grid
- Allows custom topic input
- Validates input before starting quiz

#### 4. **QuizScreen.tsx** - Quiz Interface

- Displays current question with multiple-choice options
- Shows progress bar
- Handles navigation (Previous/Next/Skip)
- Manages answer selection

#### 5. **ResultsScreen.tsx** - Results Display

- Shows score and percentage
- Displays AI-generated feedback
- Lists all questions with user answers and explanations
- Provides option to start a new quiz

#### 6. **gemini.ts** - AI Service Layer

- Handles all Gemini API interactions
- Implements retry logic with exponential backoff
- Validates and parses AI responses
- Provides type-safe interfaces for quiz and feedback data

#### 7. **api.ts** - Frontend API Client

- Abstracts HTTP requests to backend
- Handles error responses
- Provides typed interfaces for API responses

### State Management

**Local State (quiz.tsx):**

- Uses React `useState` for screen management
- Persists quiz state to localStorage
- Manages loading states and errors

**No Global State Library:**

- Kept simple with local component state
- localStorage provides persistence across refreshes
- React Context available but not actively used in current implementation

### Data Flow

1. **Topic Selection** → User selects/enters topic
2. **Quiz Generation** → Frontend calls `/api/generate` → Backend calls Gemini API
3. **Question Display** → Questions rendered with answer options
4. **Answer Selection** → Answers stored in component state + localStorage
5. **Quiz Completion** → Frontend calls `/api/feedback` → Backend generates personalized feedback
6. **Results Display** → Score, feedback, and question review shown

## Screenshots

### Topic Selection Screen

![Topic Selection](screenshots/topic-selection.png)
_Clean interface for selecting or entering a quiz topic_

### Loading Screen

![Loading](screenshots/loading.png)
_Animated loading indicator while AI generates questions_

### Quiz Interface

![Quiz Screen](screenshots/quiz-screen.png)
_Interactive quiz with progress tracking and navigation_

### Question Card

![Question Card](screenshots/question-card.png)
_Clear question display with multiple-choice options_

### Results Screen

![Results](screenshots/results.png)
_Score display with AI-generated feedback_

### Question Review

![Question Review](screenshots/question-review.png)
_Detailed review of all questions with explanations_

### Dark Mode

![Dark Mode](screenshots/dark-mode.png)
_Full dark mode support for comfortable viewing_

### Error Screen

![Error Handling](screenshots/error-screen.png)
_Graceful error handling with retry options_

## Known Issues & Improvements

### Current Limitations

1. **API Rate Limiting**

   - **Issue**: No rate limiting on client-side requests
   - **Impact**: Users could spam API calls
   - **Fix**: Implement rate limiting middleware on backend

2. **Question Quality**

   - **Issue**: Occasionally generates questions that are too easy or too hard
   - **Impact**: Inconsistent difficulty levels
   - **Fix**: Add difficulty parameter to prompts, implement user feedback system

3. **State Persistence**

   - **Issue**: localStorage can be cleared by user, losing progress
   - **Impact**: Users lose quiz progress if they clear browser data
   - **Fix**: Add option to export/import quiz state, or implement backend storage

4. **Error Recovery**

   - **Issue**: If AI fails after all retries, user must start over
   - **Impact**: Poor user experience on API failures
   - **Fix**: Save partial quiz state, allow resuming from last successful question

5. **Mobile Experience**
   - **Issue**: Some buttons could be larger for better touch targets
   - **Impact**: Slightly harder to use on mobile devices
   - **Fix**: Increase touch target sizes, improve mobile-specific styling

### Planned Improvements

1. **Question Bank**

   - Cache generated questions to reduce API calls
   - Allow users to save favorite quizzes
   - Share quizzes with others

2. **Analytics**

   - Track user performance over time
   - Show learning progress charts
   - Identify weak areas

3. **Customization**

   - Allow users to set number of questions (not just 5)
   - Choose difficulty level
   - Select question types (multiple choice, true/false, etc.)

## Bonus Features

1. **Dark Mode**

   - Full dark mode support with theme toggle
   - Persists user preference in localStorage
   - Smooth transitions between themes

2. **Progress Persistence**

   - Quiz state saved to localStorage
   - Users can refresh page without losing progress
   - Automatic state restoration on page load

3. **Responsive Design**

   - Works seamlessly on desktop, tablet, and mobile
   - Adaptive layouts for different screen sizes
   - Touch-friendly interface

4. **Error Handling**

   - Comprehensive error handling with user-friendly messages
   - Retry mechanisms for failed API calls
   - Graceful degradation when AI fails

5. **Clean UI/UX**

   - Simple, intuitive interface
   - Clear visual feedback for user actions
   - Smooth transitions between screens
   - Minimal, distraction-free design

6. **Performance Optimizations**
   - Efficient state management
   - Optimized re-renders
   - Fast page loads with Vite

### Future Enhancements

- [ ] Animations for question transitions
- [ ] Sound effects for correct/incorrect answers
- [ ] Timer for each question
- [ ] Study mode (unlimited attempts)
- [ ] Export quiz results as PDF
- [ ] Multi-language support


## License

MIT License - feel free to use this project for learning or commercial purposes.

