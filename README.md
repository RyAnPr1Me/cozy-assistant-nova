
# AI Assistant with Smart Web Search and Financial Information

## Overview

This project is an advanced AI assistant that intelligently integrates multiple data sources to provide rich, contextual responses to user queries. It features cutting-edge natural language processing capabilities combined with real-time data from web searches, financial markets, weather services, and personal information management.

## Key Features

- **Intelligent Search Engine Selection**: Automatically determines whether to use Exa or SearXNG search engines based on the nature of the query
- **Financial Data Integration**: Real-time stock quotes and company information via AlphaVantage API
- **Personal Information Management**: Calendar events and bookmark management capabilities
- **Multi-Modal AI**: Switch between Gemini and PlayAI models for different use cases
- **Command System**: Execute commands directly from natural language input
- **Voice Input**: Supports speech recognition for hands-free interaction
- **Rich Context Awareness**: Learns user preferences to provide personalized responses
- **Weather & News**: Real-time weather forecasts and news updates

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **AI Integration**: Google's Gemini API and PlayAI
- **Search APIs**: Exa and SearXNG for comprehensive web search capabilities
- **Financial Data**: AlphaVantage API for stock market information
- **State Management**: React Context and custom hooks

## Usage Examples

- "What's the weather like in Boston?"
- "Tell me about AAPL stock performance"
- "Search for the latest research on quantum computing"
- "Add a bookmark for lovable.dev with the description 'AI web development platform'"
- "Add an event for my dentist appointment next Tuesday at 2pm"
- "Show me the latest news about artificial intelligence"

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open your browser to the displayed local URL

## API Keys

This project uses several external APIs that require authentication:
- AlphaVantage for financial data
- Exa for web search
- Google's Gemini for AI processing

Store your API keys securely and never commit them directly to the repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
