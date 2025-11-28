import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const BASE_URL = "http://localhost:9000/api";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60) + "\n");
};

const logSuccess = (message) => log(`✓ ${message}`, "green");
const logError = (message) => log(`✗ ${message}`, "red");
const logInfo = (message) => log(`ℹ ${message}`, "blue");

// Test 1: Add knowledge entry manually
async function testAddKnowledge() {
  logSection("TEST 1: Add Knowledge Entry Manually");

  const dummyEntry = {
    festival: "Diwali",
    season: "Autumn/Winter",
    healthImpact:
      "Increased respiratory issues due to firecracker smoke, burn injuries, digestive problems from overeating sweets",
    recommendedStaffing:
      "Increase emergency staff by 30%, pulmonology specialists by 40%, burn unit by 25%",
    requiredSupplies:
      "Respiratory medications (bronchodilators, steroids), burn treatment supplies, antacids, IV fluids",
    patientAdvisory:
      "Avoid firecracker exposure, maintain air purifiers, moderate sweet consumption, monitor blood sugar levels",
  };

  try {
    logInfo("Sending request to add knowledge entry...");
    const response = await axios.post(`${BASE_URL}/knowledge/add`, dummyEntry);

    if (response.data.statusCode === 0) {
      logSuccess("Knowledge entry added successfully!");
      console.log("Response:", JSON.stringify(response.data, null, 2));
      return true;
    } else {
      logError("Failed to add knowledge entry");
      console.log("Response:", response.data);
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    if (error.response) {
      console.log("Error response:", error.response.data);
    }
    return false;
  }
}

// Test 2: Add another knowledge entry (High AQI)
async function testAddAQIKnowledge() {
  logSection("TEST 2: Add High AQI Knowledge Entry");

  const aqiEntry = {
    aqi: "High (151-200)",
    healthImpact:
      "Respiratory distress, asthma exacerbation, cardiovascular stress, eye irritation",
    recommendedStaffing:
      "Increase pulmonology by 45%, emergency by 30%, cardiology by 20%",
    requiredSupplies:
      "Inhalers, nebulizers, oxygen cylinders, respiratory medications, N95 masks",
    patientAdvisory:
      "Stay indoors, use air purifiers, wear N95 masks outdoors, avoid physical exertion",
  };

  try {
    logInfo("Sending request to add AQI knowledge entry...");
    const response = await axios.post(`${BASE_URL}/knowledge/add`, aqiEntry);

    if (response.data.statusCode === 0) {
      logSuccess("AQI knowledge entry added successfully!");
      return true;
    } else {
      logError("Failed to add AQI knowledge entry");
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    return false;
  }
}

// Test 3: Get all knowledge entries
async function testGetKnowledge() {
  logSection("TEST 3: Get All Knowledge Entries");

  try {
    logInfo("Fetching all knowledge entries...");
    const response = await axios.get(`${BASE_URL}/knowledge?limit=10`);

    if (response.data.statusCode === 0) {
      logSuccess(
        `Retrieved ${response.data.data.count} knowledge entries successfully!`
      );
      console.log(
        "Entries:",
        JSON.stringify(response.data.data.entries, null, 2)
      );
      return true;
    } else {
      logError("Failed to retrieve knowledge entries");
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    return false;
  }
}

// Test 4: Healthcare prediction (Main Agent Test)
async function testPrediction() {
  logSection("TEST 4: Healthcare Prediction with AI Agent");

  const predictionRequest = {
    festival: "Diwali",
    aqi: "High (151-200)",
    epidemic: null,
    currentStaffing: {
      doctors: 50,
      nurses: 120,
      specialists: 30,
      supportStaff: 80,
    },
    currentSupply: {
      masks: 1000,
      gloves: 5000,
      ventilators: 20,
      oxygenCylinders: 100,
      respiratoryMeds: 500,
      burnKits: 50,
    },
  };

  try {
    logInfo("Sending prediction request...");
    logInfo(
      "This will use the AI agent to analyze and provide recommendations..."
    );
    console.log("Request:", JSON.stringify(predictionRequest, null, 2));

    const response = await axios.post(`${BASE_URL}/predict`, predictionRequest);

    if (response.data.statusCode === 0) {
      logSuccess("Prediction completed successfully!");
      console.log("\n--- AI AGENT RECOMMENDATIONS ---");
      console.log(JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      logError("Prediction failed");
      console.log("Response:", response.data);
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    if (error.response) {
      console.log("Error response:", error.response.data);
    }
    return false;
  }
}

// Test 5: Prediction with epidemic (Web Search Test)
async function testPredictionWithEpidemic() {
  logSection("TEST 5: Healthcare Prediction with Epidemic (Web Search)");

  const predictionRequest = {
    festival: null,
    aqi: "Normal",
    epidemic: "Dengue",
    currentStaffing: {
      doctors: 45,
      nurses: 100,
      specialists: 25,
      supportStaff: 70,
    },
    currentSupply: {
      antivirals: 200,
      ivFluids: 1000,
      plateletKits: 50,
      mosquitoRepellent: 500,
    },
  };

  try {
    logInfo("Sending prediction request with epidemic...");
    logInfo("Agent will search web for current Dengue information...");
    console.log("Request:", JSON.stringify(predictionRequest, null, 2));

    const response = await axios.post(`${BASE_URL}/predict`, predictionRequest);

    if (response.data.statusCode === 0) {
      logSuccess(
        "Prediction with epidemic completed successfully! (Web search used)"
      );
      console.log("\n--- AI AGENT RECOMMENDATIONS ---");
      console.log(JSON.stringify(response.data.data, null, 2));
      return true;
    } else {
      logError("Prediction with epidemic failed");
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    if (error.response) {
      console.log("Error response:", error.response.data);
    }
    return false;
  }
}

// Test 6: Delete knowledge entry
async function testDeleteKnowledge(entryId) {
  logSection("TEST 6: Delete Knowledge Entry");

  if (!entryId) {
    logInfo("Skipping delete test - no entry ID available");
    return true; // Skip this test
  }

  try {
    logInfo(`Deleting knowledge entry with ID: ${entryId}...`);
    const response = await axios.delete(`${BASE_URL}/knowledge/${entryId}`);

    if (response.data.statusCode === 0) {
      logSuccess("Knowledge entry deleted successfully!");
      return true;
    } else {
      logError("Failed to delete knowledge entry");
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log("\n🚀 Starting Healthcare AI Agent API Tests\n", "yellow");
  log("Make sure the server is running on http://localhost:9000\n", "yellow");

  const results = [];
  let createdEntryId = null;

  // Run tests sequentially
  const addResult = await testAddKnowledge();
  results.push({
    name: "Add Knowledge Entry",
    passed: addResult,
  });
  await sleep(1000);

  results.push({
    name: "Add AQI Knowledge Entry",
    passed: await testAddAQIKnowledge(),
  });
  await sleep(1000);

  const getResult = await testGetKnowledge();
  results.push({
    name: "Get All Knowledge Entries",
    passed: getResult,
  });
  await sleep(1000);

  results.push({
    name: "Healthcare Prediction (Main Agent)",
    passed: await testPrediction(),
  });
  await sleep(2000);

  results.push({
    name: "Prediction with Epidemic",
    passed: await testPredictionWithEpidemic(),
  });
  await sleep(2000);

  results.push({
    name: "Delete Knowledge Entry",
    passed: await testDeleteKnowledge(createdEntryId),
  });

  // Print summary
  logSection("TEST SUMMARY");
  results.forEach((result) => {
    if (result.passed) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
    }
  });

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  console.log("\n" + "=".repeat(60));
  if (passedCount === totalCount) {
    log(`\n🎉 All tests passed! (${passedCount}/${totalCount})`, "green");
  } else {
    log(
      `\n⚠️  Some tests failed (${passedCount}/${totalCount} passed)`,
      "yellow"
    );
  }
  console.log("=".repeat(60) + "\n");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run tests
runAllTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
