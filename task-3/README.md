# Task 3 - AI Learning Assistant Bot

## Overview

This project is a Telegram-based AI Learning Assistant built with n8n.

The bot allows users to:

- Learn from online articles
- Generate AI summaries
- Save learning materials
- Generate quizzes based on saved materials

## Commands

### /start

Displays welcome information and available commands.

### /learn [url]

Fetches article content from the provided URL.

The Teacher AI generates:

- Title
- Difficulty level
- Key concepts
- Structured summary

The material is saved for future quiz generation.

Example:

/learn https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/What_is_CSS

### /quiz

Displays available saved learning materials.

### /quiz1 - /quiz5

Generates quiz questions for the selected material.

## Architecture

Telegram Bot

↓

Switch Node

↓

HTTP Request

↓

Teacher AI Agent

↓

Data Table Storage

↓

Quiz Retrieval

↓

Examiner AI Agent

↓

Quiz Generation

## Data Storage

The workflow uses the learning_materials Data Table.

Stored fields:

- userId
- url
- content
- summary
- createdAtCustom

## Technologies

- n8n
- Telegram Bot API
- Google Gemini
- JavaScript
- HTTP Request
- Data Tables

## Setup

1. Import workflow JSON into n8n.
2. Configure Telegram credentials.
3. Configure Gemini credentials.
4. Publish workflow.
5. Start using the Telegram bot.

## Telegram Bot

Replace this section with your bot link:

https://t.me/learning_quiz_teacher_bot

## Repository Structure

task-3/

- README.md
- report.md
- Task 3 - Learning Assistant Bot.json
