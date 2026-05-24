# Task 3 Report - AI Learning Assistant Bot

## Tools Used

- n8n
- Telegram Bot API
- HTTP Request Node
- AI Agent Nodes
- Google Gemini Chat Model
- JavaScript Code Nodes
- n8n Data Tables

## What Was Implemented

The workflow implements a Telegram-based AI Learning Assistant.

Supported commands:

- /start
- /learn [url]
- /quiz
- /quiz1
- /quiz2
- /quiz3
- /quiz4
- /quiz5

The /learn command fetches real content from a submitted URL using an HTTP Request node.

The Teacher AI analyzes the content and generates:

- Title
- Difficulty level
- Key Concepts
- Structured Summary

The generated learning material is stored in the learning_materials Data Table.

The /quiz command retrieves previously saved materials and displays available learning topics.

The /quiz1 - /quiz5 commands generate quiz questions based on the selected learning material.

The workflow stores materials between sessions, allowing users to return later and continue learning.

## What Worked

- Telegram Bot integration
- URL content extraction
- AI-generated summaries
- Difficulty estimation
- Key concepts extraction
- Learning material persistence
- User-specific material retrieval
- Topic selection through quiz commands
- Material-specific quiz generation
- Workflow execution without restart

## Challenges Encountered

Several AI model limitations were encountered during development:

- Gemini quota limits
- Temporary service unavailability
- Token length restrictions
- Model availability issues

To improve reliability, content preprocessing and truncation were added before sending data to AI models.

## Design Decisions

The workflow uses Data Tables for persistent storage of learning materials.

Quiz topic selection is implemented through /quiz1 - /quiz5 commands to provide a stable and simple MVP solution.

Content is cleaned before being processed by AI models to reduce token usage and improve response quality.

## Future Improvements

Planned future enhancements include:

- Inline keyboard topic selection
- One-question-at-a-time quiz flow
- Answer tracking
- Score calculation
- Detailed answer explanations
- Final quiz results summary
- Persistent quiz history

## Conclusion

The project successfully demonstrates an AI-powered learning assistant capable of processing learning materials from URLs, generating structured summaries, storing user data, and creating material-specific quizzes using AI.
