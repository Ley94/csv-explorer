# CSV Explorer

A modern web application for uploading, viewing, and searching CSV data with real-time feedback and responsive design.

## Features

- CSV file upload with progress indication
- Paginated data display
- Search functionality

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Containerization**: Docker

## Prerequisites

- Git
- Docker (version 28.0.4 or higher)
- Docker Compose (version 2.34.0 or higher). Download Docker and Docker Compose via [Docker Desktop](https://docs.docker.com/desktop/release-notes/#4400).

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/Ley94/csv-explorer.git
cd csv-explorer
```

2. Configure a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name
DB_PORT=5432

# Backend
BACKEND_PORT=3001
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${DB_PORT}/${POSTGRES_DB}

# Frontend
FRONTEND_PORT=3000
REACT_APP_API_BASE_URL=http://localhost:${BACKEND_PORT}
```

3. Launch the application:

```bash
docker compose up
```

4. Open your browser and visit http://localhost:3000.

5. Stop the application:

```bash
docker compose down # Stop the containers
docker compose down -v # Stop the containers and remove the volumes
```

## Running Tests

Make sure you have Node.js and npm installed on your machine before running the tests. Install [Node.js](https://nodejs.org/en).

### Backend Tests

```bash
cd backend
npm install
npm run test
```

### Frontend Tests

```bash
cd frontend
npm install
npm run test
```

## How to Use

1. Upload a CSV file. A sample CSV file is provided in the `sample.csv` file.
   - Click "Choose File" to select a file.
   - Sample file provided: `sample.csv`
   - Click "Upload File" to upload the file.
2. View the uploaded data.
   - The data will be displayed in a table format.
   - The table is paginated, showing 10 rows per page.
   - Use the pagination controls to navigate between pages.
3. Search for data.
   - Use the search bar at the top of the page to search for data.

## Demo Video

- Watch the demo video [here](https://www.loom.com/share/4bab3585c3f74351986af8686968934b).
