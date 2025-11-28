# PostgreSQL Integration - Healthcare Agent

## Overview

The Healthcare Agent now uses **PostgreSQL** as the primary database for storing predictions and knowledge entries, alongside Qdrant for vector search capabilities.

---

## Architecture

### Dual Storage System:
1. **PostgreSQL** - Structured relational data storage
   - Predictions with full details
   - Knowledge base entries
   - File upload tracking
   - Supports complex queries, transactions, and ACID compliance

2. **Qdrant** - Vector database for semantic search
   - Knowledge base embeddings
   - Fast similarity search for healthcare recommendations

---

## Docker Setup

### Services Running:

```yaml
✅ PostgreSQL (Port 5433)
✅ pgAdmin (Port 5050)
✅ Qdrant (Port 6333) - existing
```

### Starting the Containers:

```bash
cd /home/omkarc/Documents/genAI/HealthcareAgent/backend
docker compose up -d
```

### Stopping the Containers:

```bash
docker compose down
```

### View Container Status:

```bash
docker ps --filter "name=healthcare"
```

---

## Database Configuration

### Connection Details:

```
Host: localhost
Port: 5433
Database: healthcare_db
User: healthcare_user
Password: healthcare_pass_2024
```

### Environment Variables (.env):

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=healthcare_user
POSTGRES_PASSWORD=healthcare_pass_2024
POSTGRES_DB=healthcare_db
```

---

## Database Schema

### Tables Created:

#### 1. **predictions**
Stores all AI-generated predictions with full context.

```sql
Columns:
- id (UUID, Primary Key)
- festival (VARCHAR)
- aqi (VARCHAR)
- epidemic (VARCHAR)
- current_staffing (JSONB)
- current_supply (JSONB)
- recommendations (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_predictions_created_at` - Fast time-based queries
- `idx_predictions_festival` - Filter by festival
- `idx_predictions_aqi` - Filter by AQI level
- `idx_predictions_epidemic` - Filter by epidemic

#### 2. **knowledge_entries**
Healthcare knowledge base from uploaded files and manual entries.

```sql
Columns:
- id (UUID, Primary Key)
- festival (VARCHAR)
- aqi (VARCHAR)
- season (VARCHAR)
- health_impact (TEXT)
- recommended_staffing (TEXT)
- required_supplies (TEXT)
- patient_advisory (TEXT)
- source (VARCHAR) - 'pdf', 'csv', 'excel', 'manual'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_knowledge_festival`
- `idx_knowledge_aqi`
- `idx_knowledge_season`
- `idx_knowledge_created_at`

#### 3. **uploaded_files**
Tracks file uploads and processing status.

```sql
Columns:
- id (UUID, Primary Key)
- filename (VARCHAR)
- file_type (VARCHAR)
- file_size (INTEGER)
- entries_extracted (INTEGER)
- upload_status (VARCHAR) - 'processing', 'completed', 'failed'
- error_message (TEXT)
- created_at (TIMESTAMP)
```

### Views:

#### **prediction_statistics**
Aggregated statistics about predictions.

#### **knowledge_statistics**
Statistics about knowledge base entries by source.

---

## Database Models

### Location: `/backend/models/`

#### **Prediction.js**
```javascript
import Prediction from '../models/Prediction.js';

// Create new prediction
await Prediction.create(predictionData);

// Get all predictions with pagination
await Prediction.getAll(limit, offset);

// Get by ID
await Prediction.getById(id);

// Search with filters
await Prediction.search({ festival, aqi, epidemic, limit, offset });

// Delete
await Prediction.delete(id);

// Get statistics
await Prediction.getStatistics();

// Get recent (last 7 days)
await Prediction.getRecent(7);
```

#### **KnowledgeEntry.js**
```javascript
import KnowledgeEntry from '../models/KnowledgeEntry.js';

// Create single entry
await KnowledgeEntry.create(entryData);

// Bulk create (for file uploads)
await KnowledgeEntry.createMany(entries);

// Get all with pagination
await KnowledgeEntry.getAll(limit, offset);

// Search
await KnowledgeEntry.search({ festival, aqi, season, searchText, limit, offset });

// Update
await KnowledgeEntry.update(id, updateData);

// Delete
await KnowledgeEntry.delete(id);

// Get statistics
await KnowledgeEntry.getStatistics();
```

---

## pgAdmin Access

### Web Interface:
**URL:** http://localhost:5050

### Login Credentials:
```
Email: admin@healthcare.com
Password: admin123
```

### Connecting to PostgreSQL from pgAdmin:

1. Open pgAdmin at http://localhost:5050
2. Right-click "Servers" → "Register" → "Server"
3. **General Tab:**
   - Name: Healthcare DB
4. **Connection Tab:**
   - Host: postgres (use container name, not localhost)
   - Port: 5432 (internal Docker port)
   - Database: healthcare_db
   - Username: healthcare_user
   - Password: healthcare_pass_2024
5. Click "Save"

---

## Code Integration

### Predictions are now saved to BOTH:
1. **PostgreSQL** (structured, queryable data)
2. **Qdrant** (for vector-based search)

### Example from predictService.js:

```javascript
import Prediction from '../models/Prediction.js';

// Save to both storages
const qdrantId = await savePrediction(predictionResult);
const pgResult = await Prediction.create({
  festival,
  aqi,
  epidemic,
  currentStaffing,
  currentSupply,
  recommendations: predictionResult.recommendations
});
```

---

## Database Connection Pool

### Configuration: `/backend/config/database.js`

```javascript
import { query, transaction, healthCheck } from '../config/database.js';

// Execute query
const result = await query('SELECT * FROM predictions LIMIT 10');

// Transaction example
await transaction(async (client) => {
  await client.query('INSERT INTO predictions...');
  await client.query('UPDATE knowledge_entries...');
});

// Health check
const health = await healthCheck();
```

**Connection Pool Settings:**
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

---

## Sample Queries

### Get Recent Predictions:
```sql
SELECT * FROM predictions
ORDER BY created_at DESC
LIMIT 10;
```

### Search by Festival:
```sql
SELECT * FROM predictions
WHERE festival ILIKE '%diwali%'
ORDER BY created_at DESC;
```

### Get Knowledge by Season:
```sql
SELECT * FROM knowledge_entries
WHERE season = 'Monsoon';
```

### Prediction Statistics:
```sql
SELECT * FROM prediction_statistics;
```

### Count by Source:
```sql
SELECT source, COUNT(*) as count
FROM knowledge_entries
GROUP BY source;
```

---

## API Endpoints (Future Enhancement)

The following endpoints can be created using the models:

### Predictions:
- `GET /api/predictions` - List all predictions
- `GET /api/predictions/:id` - Get single prediction
- `GET /api/predictions/search` - Search predictions
- `GET /api/predictions/stats` - Get statistics
- `DELETE /api/predictions/:id` - Delete prediction

### Knowledge:
- `GET /api/knowledge` - List all knowledge entries (already exists)
- `GET /api/knowledge/:id` - Get single entry
- `GET /api/knowledge/search` - Search entries
- `PUT /api/knowledge/:id` - Update entry
- `DELETE /api/knowledge/:id` - Delete entry (already exists)
- `GET /api/knowledge/stats` - Get statistics

---

## Backup & Restore

### Backup Database:
```bash
docker exec healthcare_postgres pg_dump -U healthcare_user healthcare_db > backup.sql
```

### Restore Database:
```bash
docker exec -i healthcare_postgres psql -U healthcare_user healthcare_db < backup.sql
```

---

## Troubleshooting

### Container won't start:
```bash
# Check logs
docker logs healthcare_postgres
docker logs healthcare_pgadmin

# Restart containers
docker compose restart
```

### Can't connect from pgAdmin:
- Use container name `postgres` as host (not `localhost`)
- Use internal port `5432` (not `5433`)
- Ensure both containers are on same network

### Port already in use:
- Change ports in `docker-compose.yml`
- Update `.env` file accordingly
- Restart containers

### Database connection error in app:
```bash
# Test connection
docker exec healthcare_postgres pg_isready -U healthcare_user -d healthcare_db

# Check env variables
cat .env | grep POSTGRES
```

---

## Migration from Qdrant-only

The system now uses **dual storage**:
- Old predictions in Qdrant remain accessible
- New predictions saved to both PostgreSQL and Qdrant
- No data loss or migration needed
- PostgreSQL provides better querying and analysis capabilities

---

## Performance Considerations

### Indexes:
All frequently queried columns have indexes for optimal performance.

### Connection Pooling:
20 concurrent connections handled efficiently.

### JSONB Columns:
Flexible storage for complex nested data (staffing, supplies, recommendations).

### Automatic Timestamps:
`created_at` and `updated_at` managed by database triggers.

---

## Security

### Current Setup (Development):
- Basic password authentication
- No SSL (local development)
- pgAdmin in single-user mode

### Production Recommendations:
1. Use strong passwords (not defaults)
2. Enable SSL connections
3. Restrict network access
4. Use environment-specific credentials
5. Enable pgAdmin multi-user mode with proper auth
6. Regular backups
7. Audit logging

---

## Next Steps

1. ✅ PostgreSQL container running
2. ✅ Database schema created
3. ✅ Models implemented
4. ✅ Predictions saving to PostgreSQL
5. ⏳ Create CRUD API endpoints
6. ⏳ Update frontend to use new APIs
7. ⏳ Add analytics/reporting features
8. ⏳ Implement data export functionality

---

## Quick Reference

### Start Everything:
```bash
cd backend
docker compose up -d
npm start
```

### Access Points:
- Backend API: http://localhost:9000
- pgAdmin: http://localhost:5050
- Qdrant Dashboard: http://localhost:6333/dashboard
- PostgreSQL: localhost:5433

### Default Credentials:
```
PostgreSQL:
  User: healthcare_user
  Password: healthcare_pass_2024

pgAdmin:
  Email: admin@healthcare.com
  Password: admin123
```

---

**Last Updated:** 2025-11-27
**Version:** 1.0
