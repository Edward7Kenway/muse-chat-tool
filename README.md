# AI Companion Chat

Build a fully functional text-based AI chat application inspired by the current Google Gemini web interface, but do NOT copy Google's branding, logo, proprietary assets, or exact visual design. The application should feel modern, professional, clean, and production-ready.

1. Core Requirement

Create a working text-based AI assistant with:

Gemini API integration

Chat interface

Multiple AI model selection

New chat

Chat history/sidebar

Message streaming if supported by the API

Markdown rendering

Code blocks with syntax highlighting

Copy button for code blocks

Copy response button

Regenerate response

Stop generation

Proper loading states

Error handling

Responsive UI

Separate configuration file for the Gemini API key

The application must be FUNCTIONAL, not just a UI mockup.

2. Technology

Use a clean modern frontend architecture.

Preferred:

React

TypeScript

Tailwind CSS

Modern component-based architecture

Gemini API SDK/API integration

LocalStorage for chat persistence if no backend/database is required

Keep the project easy to run locally.

The application should work with:

npm install
npm run dev


3. Gemini API Configuration

IMPORTANT:

Create a separate configuration file specifically for the Gemini API configuration.

For example:

src/config.ts


or:

src/config.js


The file should contain:

export const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";


I should be able to simply open this file and paste my Gemini API key.

Do NOT hardcode the API key throughout the application.

Every Gemini API request must use the value from this configuration file.

Add a clear comment:

// Paste your Gemini API key here


Also structure the API integration so that the API key can easily be moved to an environment variable later.

IMPORTANT SECURITY NOTE:

Since this is a frontend application, clearly separate the configuration layer so the API key is easy to replace. Do not expose the key anywhere else in the source code.

4. ONLY 3 AI MODELS

Do NOT show a huge list of Gemini models.

The model selector should contain ONLY 3 models.

Use these three model options:

Model 1 — Fast

Display name:

Gemini Fast


Purpose:

Fast everyday responses

General questions

Quick coding help

Low latency

Model 2 — Pro

Display name:

Gemini Pro


Purpose:

More capable reasoning

Coding

Technical questions

Detailed responses

Model 3 — Deep Thinking

Display name:

Gemini Deep Thinking


Purpose:

Complex reasoning

Architecture

Difficult programming problems

Detailed analysis

IMPORTANT:

Keep the UI names friendly and professional, but map each option to a configurable Gemini model ID in the configuration/API layer.

For example:

export const MODELS = {
  fast: "MODEL_ID_HERE",
  pro: "MODEL_ID_HERE",
  thinking: "MODEL_ID_HERE"
};


Make the model IDs easy to change later.

Do NOT hardcode model IDs in multiple components.

5. MAIN LAYOUT

Create a professional two-panel application.

LEFT SIDEBAR

The left sidebar should contain:

Top

Application name/logo

New Chat button

Example:

+ New Chat


Chat History

Show previous conversations.

Example:

Today

How to deploy React on AWS
Kubernetes troubleshooting
Terraform VPC setup

Yesterday

Docker networking
Prometheus configuration


Chat history should be clickable.

Clicking a conversation should load that conversation.

Use LocalStorage so conversations remain after refreshing the page.

6. NEW EXTRA FEATURE — DRAFT MAIL

Add a dedicated feature in the LEFT SIDEBAR called:

✉ Draft Mail


This should be separate from normal AI chat.

When the user clicks Draft Mail, open a dedicated mail drafting interface.

The mail interface should allow:

Recipient

To


Subject

Subject


User Instructions

Large text box:

Describe what you want to write...


Example:

Write an email requesting one day leave because I am sick.


Then provide:

Generate Mail


button.

The AI should generate a professional email based on the user's instructions.

7. MAIL TONE DROPDOWN

Inside the Draft Mail interface, add a clearly visible:

Tone


dropdown.

The dropdown must contain 5 options:

1. Professional

For formal workplace communication.

2. Friendly

Professional but warm and approachable.

3. Casual

Relaxed and conversational.

4. Formal

Very polished and highly professional.

5. Concise

Short, direct, and to the point.

Example UI:

Tone
[ Professional ▼ ]

Professional
Friendly
Casual
Formal
Concise


The selected tone must actually affect the generated email.

For example:

If the user selects:

Concise


the prompt sent to Gemini should instruct the model to produce a short and direct email.

If:

Formal


is selected, the email should be highly professional and formal.

8. MAIL GENERATION

When the user clicks:

Generate Mail


send a structured prompt to Gemini.

Example logic:

You are an expert professional email writer.

Write an email based on the user's instructions.

Tone: {selectedTone}

Recipient: {recipient}
Subject: {subject}

User request:
{userInstructions}

Requirements:
- Follow the requested tone.
- Keep the email natural.
- Do not add unnecessary explanations.
- Return only the email body.
- Do not wrap the email in markdown unless required.


The generated email should appear in an editable text area.

9. MAIL ACTIONS

After generating an email, provide:

Copy
Regenerate
Clear


buttons.

Also allow the user to edit the generated email manually.

Add:

Copy Email


which copies the complete email body to the clipboard.

10. CHAT UI

The main chat area should look like a modern AI assistant.

At the top:

[ Gemini Fast ▼ ]


This should be the model selector.

The user should be able to switch between:

Gemini Fast

Gemini Pro

Gemini Deep Thinking

The selected model should be used for the next request.

11. WELCOME SCREEN

When there is no conversation, show a clean centered welcome screen.

Example:

Hello, how can I help you?

Ask anything, write code, troubleshoot infrastructure,
or draft a professional email.


Below it, show suggested prompts:

Explain Kubernetes architecture
Write a Dockerfile for Node.js
Create a Terraform VPC
Draft a professional leave email
Explain CI/CD pipeline


Clicking a suggestion should put the text into the input box.

12. CHAT INPUT

At the bottom of the screen create a large modern input area.

Example:

┌─────────────────────────────────────────────┐
│ Ask anything...                             │
│                                             │
│                                      ➤      │
└─────────────────────────────────────────────┘


Features:

Multiline input

Enter = send

Shift + Enter = new line

Send button

Disabled send button when empty

Loading state

Stop generation button while AI is responding

13. AI RESPONSE UI

AI responses must support Markdown.

Support:

Headings

Bold

Italic

Lists

Numbered lists

Links

Tables

Blockquotes

Inline code

Code blocks

14. CODE BLOCKS

This is VERY IMPORTANT.

Code blocks should look visually different from normal text.

For example:

┌─────────────────────────────────────────┐
│ bash                              Copy   │
├─────────────────────────────────────────┤
│ docker build -t my-app .                │
│ docker run -p 3000:3000 my-app          │
└─────────────────────────────────────────┘


Requirements:

Dark code block

Syntax highlighting

Language label

Copy button

Copy button changes to "Copied!" temporarily

Proper monospace font

Horizontal scrolling for long code

Commands and code should NOT have the same styling as normal response text.

15. MESSAGE ACTIONS

Each AI response should have small action buttons:

Copy
Regenerate


Optionally:

Like
Dislike


Keep these subtle and professional.

Do not make them visually oversized.

16. USER MESSAGES

User messages should be visually distinct from AI responses.

Keep the design clean and compact.

Avoid huge message bubbles.

The UI should prioritize readability and whitespace.

17. DESIGN REQUIREMENTS

The design should feel like a modern 2026 AI application.

Use:

Clean spacing

Proper alignment

Rounded corners

Subtle shadows

Professional typography

Consistent icon sizes

Good contrast

Minimal visual clutter

Responsive layout

IMPORTANT:

Do not make buttons, text, or cards unnecessarily huge.

Everything should be properly aligned.

The interface should look polished on:

Desktop

Laptop

Tablet

Mobile

18. SIDEBAR BEHAVIOR

Desktop:

Sidebar visible.

Mobile:

Sidebar should collapse into a hamburger menu.

The sidebar should contain:

New Chat

Chats
────────────
Recent chats...

Tools
────────────
✉ Draft Mail


Keep Draft Mail visually separated from chat history.

19. CHAT MANAGEMENT

Implement:

New Chat

Creates a new empty conversation.

Rename Chat

Allow users to rename conversations.

Delete Chat

Allow deleting a conversation.

Persistent History

Use LocalStorage.

Example structure:

{
  id: "...",
  title: "...",
  createdAt: "...",
  messages: [
    {
      role: "user",
      content: "..."
    },
    {
      role: "assistant",
      content: "..."
    }
  ]
}


20. API SERVICE ARCHITECTURE

Do NOT put Gemini API calls directly inside UI components.

Create a dedicated service.

For example:

src/
  components/
  pages/
  services/
      gemini.ts
  config.ts
  types/
  utils/


Gemini communication should be handled through:

gemini.ts


The UI should call something like:

generateResponse(...)


instead of directly calling the Gemini API.

21. CONFIGURATION ARCHITECTURE

Keep all configurable values centralized.

For example:

export const GEMINI_API_KEY = "...";

export const MODELS = {
  fast: "...",
  pro: "...",
  thinking: "..."
};


Do not duplicate these values anywhere else.

22. ERROR HANDLING

Handle common errors gracefully.

If the API key is missing:

Gemini API key is not configured.
Please add your API key in config.ts.


If authentication fails:

Authentication failed. Please check your Gemini API key.


If quota/rate limit occurs:

API limit reached. Please try again later.


If network fails:

Unable to connect to Gemini. Please check your internet connection.


Do not expose raw technical errors directly to the user unless useful.

23. LOADING EXPERIENCE

While Gemini is generating:

Show:

Thinking...


or a subtle animated loading indicator.

Do NOT freeze the UI.

The user should still be able to interact with the sidebar.

If streaming is supported, display the response progressively.

24. STOP GENERATION

While Gemini is generating:

Replace the Send button with:

Stop


Clicking Stop should cancel/abort the active request if the API implementation supports AbortController.

25. EMPTY STATES

Make empty states polished.

For chat:

Start a conversation
Ask me anything.


For Draft Mail:

Draft professional emails in seconds.
Choose a tone and describe what you need.


26. ACCESSIBILITY

Make the UI accessible.

Include:

Proper button labels

Keyboard navigation

Focus states

Accessible dropdowns

ARIA labels where needed

Good color contrast

27. RESPONSIVENESS

On mobile:

Sidebar becomes drawer

Chat takes full width

Input stays accessible at bottom

Model selector remains accessible

Mail drafting page adapts properly

Code blocks scroll horizontally instead of breaking layout

28. IMPORTANT UI DETAIL

Do NOT make the entire application look like a generic dashboard.

It should feel like an actual AI assistant.

Prioritize:

Conversation
Readability
Speed
Clean typography
Minimal UI


Avoid:

Excessive cards

Excessive gradients

Huge headings

Oversized buttons

Unnecessary animations

Cluttered navigation

Use subtle animations only where they improve UX.

29. FINAL APPLICATION STRUCTURE

The final application should have approximately this structure:

AI Assistant
│
├── Sidebar
│   ├── New Chat
│   ├── Chat History
│   └── Draft Mail
│
├── Main Chat
│   ├── Model Selector
│   │   ├── Gemini Fast
│   │   ├── Gemini Pro
│   │   └── Gemini Deep Thinking
│   │
│   ├── Welcome / Messages
│   │
│   └── Chat Input
│
└── Draft Mail
    ├── To
    ├── Subject
    ├── Tone
    │   ├── Professional
    │   ├── Friendly
    │   ├── Casual
    │   ├── Formal
    │   └── Concise
    │
    ├── Instructions
    ├── Generate Mail
    └── Generated Email
        ├── Edit
        ├── Copy
        ├── Regenerate
        └── Clear


30. MOST IMPORTANT REQUIREMENT

Do not only create the frontend design.

I need a WORKING APPLICATION.

The following must actually work:

Gemini API requests

Model switching

Chat messages

New Chat

Chat history

LocalStorage persistence

Markdown rendering

Code syntax highlighting

Code copying

Response copying

Regenerate

Stop generation

Draft Mail

Tone selection

AI-generated emails

Copy generated email

Error handling

API key configuration

Before considering the task complete, verify that the application builds successfully and that there are no obvious TypeScript/JavaScript errors.

Keep the code clean, modular, and easy to maintain.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://muse-chat-tool.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/42e1ed3b-1906-4012-a62b-4836f1f37a25).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev


AQ.Ab8RN6Ks837MqJBzL5aT8lQ8meftUHD5nCuiLsBE9-SNkV_OuQ
```
