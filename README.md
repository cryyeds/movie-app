## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your computer.

### Installation

1. Clone or download this repository.
2. Open a terminal and navigate to the project folder.
3. Install the required dependencies:

```bash
npm install
```

4. Modify `.env.local` and add your API key:

```env
VITE_API_KEY=your_api_key_here
```

### Running the Project

Start the development server:

```bash
npm run dev
```

Once the server is running, open the provided local URL in your browser.

### Important

A valid API key is required for the application to retrieve movie information, ratings, posters, and other related content,
you can get one from https://developer.themoviedb.org/reference/discover-movie 
*You need to login first to get one, in case it ask for an url you can use something like http://localhost:3000/
