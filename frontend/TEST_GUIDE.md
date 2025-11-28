# Testing Guide for Healthcare Agent MVP

## Quick Test Steps

### 1. Access the Application
Open your browser and go to: **http://localhost:5174/**

### 2. Add Sample Knowledge
1. Click on **Knowledge Base** in the navigation
2. Click **Add Entry Manually**
3. Fill in the form:
   - **Festival**: Diwali
   - **AQI Level**: High (151-200)
   - **Season**: Autumn/Winter
   - **Health Impact**: Increased respiratory issues due to firecracker smoke, burn injuries from fireworks, digestive problems from excessive sweets consumption. Emergency cases spike by 30-40%.
   - **Recommended Staffing**: Increase emergency doctors by 30%, pulmonology specialists by 40%, burn unit staff by 25%, general nurses by 35%.
   - **Required Supplies**: N95 masks, respiratory medications, inhalers, burn treatment kits, wound care supplies, oxygen cylinders, nebulizers, antacids.
   - **Patient Advisory**: Avoid firecracker exposure, use air purifiers indoors, wear N95 masks outdoors, moderate sweet consumption, stay hydrated, seek immediate medical attention for breathing difficulties or burns.
4. Click **Add Entry**
5. Verify the entry appears in the table below

### 3. Make a Prediction
1. Click on **Make Prediction** in the navigation
2. Fill in the prediction form:
   - **Festival**: Diwali
   - **AQI Level**: High (151-200)
   - **Current Staffing**:
     - Doctors: 50
     - Nurses: 120
     - Specialists: 30
     - Support Staff: 80
   - **Current Supply Inventory**:
```
masks: 1000
gloves: 5000
ventilators: 20
oxygenCylinders: 100
respiratoryMeds: 500
burnKits: 50
ivFluids: 1000
nebulizers: 30
```
3. Click **Generate Prediction**
4. Wait for AI processing (may take 10-30 seconds)

### 4. View Results
The results page should display:

✅ **Staffing Recommendations Graph**
- Bar chart comparing current vs recommended staffing levels
- Should show increases for all categories

✅ **Supply Recommendations**
- Critical supplies (must-have)
- Essential supplies (important)
- Optional supplies (nice-to-have)

✅ **Patient Advisories**
- General Public recommendations
- Vulnerable Groups guidance
- Preventive Measures

✅ **AI Reasoning**
- Explanation of why these recommendations were made

### 5. Check Dashboard
1. Go back to **Dashboard**
2. Verify:
   - Total Knowledge Entries count (should be 1+)
   - Predictions Made count (should be 1+)
   - Recent Predictions list shows your prediction

## Expected Behavior

### Knowledge Base Page
- ✅ Can add entries manually
- ✅ Can upload files (PDF, CSV, Excel)
- ✅ Shows all entries in a table
- ✅ Can delete entries
- ✅ Shows upload progress for files

### Prediction Page
- ✅ Form validation works
- ✅ At least one scenario factor required
- ✅ Loading spinner shows during processing
- ✅ Error messages display if something fails
- ✅ Redirects to results after success

### Results Page
- ✅ Graph displays with correct data
- ✅ Supply recommendations are categorized
- ✅ Patient advisories are grouped
- ✅ Can download report as text file
- ✅ Can navigate back to make another prediction

### Dashboard
- ✅ Shows correct statistics
- ✅ Displays recent predictions
- ✅ Quick action buttons work

## Troubleshooting

### Graph Not Showing
- Check browser console for errors
- Verify the prediction response has `staffingRecommendations` object
- Ensure current staffing values are numbers, not strings

### Advisories Missing
- Check if the AI agent returned structured data
- Look for `patientAdvisory` object in the response
- Backend logs may show JSON parsing issues

### No Data Saved
- Ensure Qdrant is running (Docker container)
- Check backend logs for errors
- Verify predictions collection was created

### Backend Issues
```bash
# Check Qdrant is running
docker ps | grep qdrant

# Restart backend if needed
cd backend
npm run dev
```

### Frontend Issues
```bash
# Restart frontend if needed
cd frontend
npm run dev
```

## API Testing with cURL

Test prediction directly:
```bash
curl -X POST http://localhost:9000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "festival": "Diwali",
    "aqi": "High (151-200)",
    "epidemic": null,
    "currentStaffing": {
      "doctors": 50,
      "nurses": 120,
      "specialists": 30,
      "supportStaff": 80
    },
    "currentSupply": {
      "masks": 1000,
      "gloves": 5000
    }
  }'
```

Get all predictions:
```bash
curl http://localhost:9000/api/predictions
```

Get all knowledge:
```bash
curl http://localhost:9000/api/knowledge
```

## Known Limitations

1. **Agent Response Variability**: OpenAI agent may return slightly different formats, backend handles parsing
2. **Processing Time**: Predictions take 10-30 seconds depending on agent complexity
3. **No Authentication**: MVP has no user authentication
4. **Memory Storage**: Predictions stored in Qdrant (persists in Docker volume)

## Success Criteria

✅ Can add knowledge entries manually and via upload
✅ Can make predictions with AI recommendations
✅ Predictions are saved and visible in dashboard
✅ Results display with graphs, supplies, and advisories
✅ All navigation works smoothly
✅ No console errors during normal operation
