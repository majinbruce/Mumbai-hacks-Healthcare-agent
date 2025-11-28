# Healthcare Resource Planning System

A smart healthcare management platform that predicts resource requirements during peak demand periods caused by festivals, environmental factors, and epidemics.

## Problem Statement

Healthcare facilities face significant challenges during predictable surge events like festivals (Diwali, Holi), poor air quality days, and epidemic outbreaks. Traditional planning methods often lead to:
- Understaffing during critical periods
- Inefficient resource allocation
- Delayed response to patient needs
- Reactive rather than proactive management

## Solution

Our system leverages historical data and AI-powered analysis to provide actionable insights for healthcare administrators, enabling them to:
- Predict staffing requirements across different specialties
- Optimize medical supply inventory
- Issue targeted advisories for different patient groups
- Make data-driven decisions before surge events occur

## Key Features

### Intelligent Prediction Engine
- Multi-factor analysis combining festival schedules, air quality index (AQI), and epidemic data
- Specialty-specific staffing recommendations (emergency, pulmonology, burn unit, etc.)
- Real-time supply inventory assessment with priority categorization

### Knowledge Base Management
- Manual entry creation for historical surge event data
- Bulk upload support for CSV, Excel, and PDF documents
- Searchable repository of past event impacts and responses

### Interactive Dashboard
- Live statistics on predictions and system usage
- Historical prediction tracking
- Quick access to recent recommendations

### Visual Analytics
- Comparative charts showing current vs. recommended staffing levels
- Specialty-wise breakdown of resource requirements
- Supply categorization (critical, essential, optional)

### Patient Advisory System
- Customized health advisories for general public
- Specific guidance for vulnerable populations
- Preventive measures recommendations

## Screenshots

### Dashboard
![Dashboard](screenshots/Screenshot%20from%202025-11-29%2004-27-55.png)
*Real-time statistics showing total knowledge entries, predictions made, and supported data sources*

### Knowledge Base Management
![Knowledge Base](screenshots/Screenshot%20from%202025-11-29%2004-27-43.png)
*Comprehensive knowledge repository with festival, AQI, and epidemic data for accurate predictions*

### Prediction Input Form
![Prediction Form - Scenario](screenshots/Screenshot%20from%202025-11-29%2004-28-15.png)
*Multi-factor scenario configuration with festival, AQI level, epidemic, and current staffing levels*

![Prediction Form - Inventory](screenshots/Screenshot%20from%202025-11-29%2004-28-21.png)
*Interactive supply inventory management with quick adjustment controls*

### Results & Analytics

![Staffing Recommendations](screenshots/Screenshot%20from%202025-11-29%2004-29-40.png)
*Visual comparison of current vs recommended staffing levels across all departments*

![Specialty Breakdown & Supply Needs](screenshots/Screenshot%20from%202025-11-29%2004-29-44.png)
*Detailed specialty-wise allocation and prioritized supply recommendations with reasoning*

![Patient Advisories](screenshots/Screenshot%20from%202025-11-29%2004-29-53.png)
*Targeted health advisories for general public, vulnerable groups, and preventive measures*

![AI-Powered Reasoning](screenshots/Screenshot%20from%202025-11-29%2004-29-59.png)
*Comprehensive AI analysis explaining the rationale behind all recommendations*

## Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **AI Integration**: OpenAI Agents for intelligent analysis
- **Vector Database**: Qdrant for efficient knowledge retrieval
- **Data Processing**: LangChain for document parsing and embedding
- **File Handling**: Multer for uploads, pdf-parse for PDF extraction, xlsx for Excel processing

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: TailwindCSS v4
- **Routing**: React Router v7
- **Visualizations**: Recharts for data charts
- **Forms**: React Hook Form for validation
- **Icons**: Lucide React

### Infrastructure
- **Database**: Qdrant (Docker)
- **Development**: Nodemon for hot reload
- **API Testing**: Morgan for logging

## Architecture

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│   Frontend  │  HTTP    │   Express    │   Query  │   Qdrant    │
│  (React)    │◄────────►│   Backend    │◄────────►│  (Vector DB)│
└─────────────┘          └──────────────┘          └─────────────┘
                                │
                                │ API Calls
                                ▼
                         ┌──────────────┐
                         │   OpenAI     │
                         │   Agents     │
                         └──────────────┘
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd HealthcareAgent
```

2. Start Qdrant database
```bash
cd backend
docker-compose up -d
```

3. Configure backend environment
```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

4. Install backend dependencies and start server
```bash
npm install
npm run dev
```
Backend will run on `http://localhost:9000`

5. Configure and start frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5174`

### Environment Variables

**Backend (.env)**
```
OPENAI_API_KEY=your_openai_api_key_here
QDRANT_URL=http://localhost:6333
PORT=9000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:9000
```

## Usage Guide

### Adding Knowledge Entries

1. Navigate to **Knowledge Base** section
2. Click **Add Entry Manually**
3. Provide structured information about past surge events including:
   - Event details (festival name, AQI level, season)
   - Observed health impacts
   - Required staffing adjustments
   - Supply requirements
   - Patient advisories

### Generating Predictions

1. Go to **Make Prediction** page
2. Enter event parameters:
   - Festival or event type
   - Expected AQI level
   - Any concurrent epidemics
3. Input current resource levels:
   - Doctors, nurses, specialists, support staff counts
   - Current supply inventory
4. Click **Generate Prediction**
5. View comprehensive recommendations including:
   - Staffing adjustments by specialty
   - Supply requirements prioritized by urgency
   - Public health advisories
   - AI-generated insights and reasoning

### Viewing History

Access the **Dashboard** to:
- Review past predictions
- Track system usage statistics
- Download previous reports

## API Endpoints

### Knowledge Management
- `GET /api/knowledge` - Retrieve all knowledge entries
- `POST /api/knowledge/add` - Add new entry
- `POST /api/knowledge/upload` - Upload document (PDF/CSV/Excel)
- `DELETE /api/knowledge/:id` - Remove entry

### Predictions
- `POST /api/predict` - Generate new prediction
- `GET /api/predictions` - List all predictions
- `GET /api/predictions/:id` - Get specific prediction

## Project Structure

```
HealthcareAgent/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   ├── agentService.js      # OpenAI agent integration
│   │   ├── predictService.js    # Prediction engine
│   │   └── qdrantService.js     # Vector DB operations
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   ├── Prediction.jsx
│   │   │   └── Results.jsx
│   │   ├── services/    # API client
│   │   └── App.jsx      # Root component
│   └── public/          # Static assets
│
└── test-files/          # Sample data for testing
```

## Future Enhancements

- User authentication and role-based access control
- Multi-hospital network support
- Predictive analytics for longer time horizons
- Integration with real-time AQI data feeds
- Mobile application for on-the-go access
- Automated alert system for predicted surges
- Integration with existing hospital management systems

## License

MIT License - see LICENSE file for details
