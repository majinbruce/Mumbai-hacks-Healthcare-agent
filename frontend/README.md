# Healthcare Agent Frontend

A modern, intuitive React-based UI for the Healthcare Resource Planning System. This application helps hospitals manage their knowledge base and generate AI-powered predictions for staffing and supply needs based on festivals, AQI levels, and epidemics.

## Features

### Dashboard
- Overview statistics of the knowledge base
- Quick action buttons for common tasks
- System information and guidance

### Knowledge Base Management
- View all knowledge entries in a sortable table
- Add entries manually with a user-friendly form
- Upload documents (PDF, CSV, Excel) for bulk import
- Delete entries with confirmation
- Real-time progress tracking for file uploads

### AI-Powered Predictions
- Input scenario details (festivals, AQI, epidemics)
- Specify current staffing levels
- Define current supply inventory
- Generate comprehensive recommendations

### Results Visualization
- Interactive charts comparing current vs recommended staffing
- Categorized supply recommendations (critical/essential/optional)
- Patient advisories for different groups
- AI reasoning explanation
- Download report as text file

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Lucide React** - Icon library

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:9000/api
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx    # Main layout wrapper
│   │   └── Navbar.jsx    # Navigation bar
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx        # Home page
│   │   ├── KnowledgeBase.jsx    # Knowledge management
│   │   ├── Prediction.jsx       # Prediction form
│   │   └── Results.jsx          # Results visualization
│   ├── services/         # API integration
│   │   └── api.js        # Axios instance and API functions
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles and Tailwind
├── public/               # Static assets
├── .env                  # Environment variables
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies
```

## Usage Guide

### Adding Knowledge

1. Navigate to **Knowledge Base**
2. Click **Add Entry Manually** to fill out a form, or
3. Click **Upload File** to upload PDF/CSV/Excel documents
4. View all entries in the table below

### Making Predictions

1. Navigate to **Make Prediction**
2. Fill in at least one scenario factor:
   - Festival or event (e.g., Diwali, Holi)
   - AQI level (select from dropdown)
   - Epidemic or disease (e.g., Dengue, COVID-19)
3. Enter current staffing levels (required)
4. Optionally add current supply inventory
5. Click **Generate Prediction**
6. View results with recommendations

### Viewing Results

The results page displays:
- Staffing comparison chart
- Specialty breakdown
- Supply recommendations by priority
- Patient advisories for different groups
- AI reasoning
- Download report option

## API Integration

The frontend connects to the backend API running on `http://localhost:9000/api` by default.

### Available Endpoints

- `GET /knowledge` - Fetch all knowledge entries
- `POST /knowledge/add` - Add a single knowledge entry
- `POST /knowledge/upload` - Upload and process documents
- `DELETE /knowledge/:id` - Delete a knowledge entry
- `POST /predict` - Generate AI predictions

See `src/services/api.js` for implementation details.

## Styling

The application uses TailwindCSS with custom theme extensions:

- **Primary colors**: Blue shades for main actions
- **Medical colors**: Teal/green shades for healthcare theme
- **Custom utilities**: Button styles, card styles, form inputs

Modify `tailwind.config.js` to customize the theme.

## Development

```bash
# Start dev server (with hot reload)
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

1. Ensure the backend is running on port 9000
2. Start the frontend dev server
3. Test all features before committing
4. Follow the existing code style

## License

MIT
