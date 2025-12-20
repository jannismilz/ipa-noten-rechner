# IPA Noten Rechner - Frontend

React + Vite frontend for the IPA Noten Rechner application.

## Features

- **Public Criteria View** - All criteria are visible without login
- **Optional Authentication** - Login for data synchronization with backend
- **Onboarding** - Profile setup after first login
- **Hybrid Storage** - Data stored in LocalStorage (offline) or Database (when logged in)
- **Collapsible Sections** - Categories and criteria can be expanded/collapsed
- **Live Grade Calculation** - Real-time score updates in progress overview
- **Export/Import** - Download and upload evaluation data as JSON
- **Responsive Design** - Mobile-friendly dark theme interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` if backend is not running on `http://localhost:3001`

3. Start development server:
```bash
npm run dev
```

## Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx       # App header with auth state
│   ├── ProgressOverview.jsx  # Grade overview & export/import
│   ├── CategorySection.jsx   # Category with criteria
│   └── CriteriaItem.jsx      # Individual criterion
├── context/
│   └── AuthContext.jsx  # Authentication state management
├── pages/
│   ├── Login.jsx        # Login page
│   ├── Onboarding.jsx   # Profile setup
│   └── Criteria.jsx     # Main criteria page
├── services/
│   ├── api.js          # Backend API calls
│   └── storage.js      # LocalStorage management
├── App.jsx             # App routing setup
└── main.jsx           # React entry point
```

## Usage

### Without Login
- View all criteria
- Check/uncheck requirements
- Add notes
- Data saved in browser LocalStorage
- Export data to JSON file

### With Login
1. Click "Anmelden" in header
2. Enter credentials
3. Complete onboarding (optional)
4. All changes automatically synced to database
5. Access data from any device

### Data Management
- **Export**: Download current state as JSON
- **Import**: Upload previously exported JSON file
- **Clear**: Logout clears synchronized data (LocalStorage persists)

## Build

```bash
npm run build
```

Outputs to `dist/` directory.

## Technologies

- React 19
- React Router 7
- Vite 7
- Lucide React (icons)
