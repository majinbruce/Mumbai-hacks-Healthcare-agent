import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Users,
  Package,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";

const Results = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = localStorage.getItem("predictionResult");
    if (!storedResult) {
      navigate("/predict");
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);

      // If recommendations is a string, parse it
      if (
        parsed.recommendations &&
        typeof parsed.recommendations === "string"
      ) {
        try {
          parsed.recommendations = JSON.parse(parsed.recommendations);
        } catch (e) {
          console.error("Error parsing recommendations:", e);
        }
      }

      setResult(parsed);
    } catch (error) {
      console.error("Error parsing result:", error);
      navigate("/predict");
    }
  }, [navigate]);

  const handleDownloadReport = () => {
    if (!result) return;

    const reportText = `
HEALTHCARE PREDICTION REPORT
Generated: ${new Date().toLocaleString()}

SCENARIO INPUTS:
${
  result.metadata?.inputs?.festival
    ? `Festival: ${result.metadata.inputs.festival}`
    : ""
}
${result.metadata?.inputs?.aqi ? `AQI: ${result.metadata.inputs.aqi}` : ""}
${
  result.metadata?.inputs?.epidemic
    ? `Epidemic: ${result.metadata.inputs.epidemic}`
    : ""
}

CURRENT STAFFING:
Doctors: ${result.metadata?.inputs?.currentStaffing?.doctors}
Nurses: ${result.metadata?.inputs?.currentStaffing?.nurses}
Specialists: ${result.metadata?.inputs?.currentStaffing?.specialists}
Support Staff: ${result.metadata?.inputs?.currentStaffing?.supportStaff}

RECOMMENDED STAFFING:
Doctors: ${result.recommendations?.staffingRecommendations?.doctors}
Nurses: ${result.recommendations?.staffingRecommendations?.nurses}
Specialists: ${result.recommendations?.staffingRecommendations?.specialists}
Support Staff: ${result.recommendations?.staffingRecommendations?.supportStaff}

SUPPLY RECOMMENDATIONS:
Critical: ${
      result.recommendations?.supplyRecommendations?.critical?.join(", ") ||
      "None"
    }
Essential: ${
      result.recommendations?.supplyRecommendations?.essential?.join(", ") ||
      "None"
    }
Optional: ${
      result.recommendations?.supplyRecommendations?.optional?.join(", ") ||
      "None"
    }

PATIENT ADVISORIES:
General Public: ${
      result.recommendations?.patientAdvisory?.generalPublic?.join("; ") ||
      "None"
    }
Vulnerable Groups: ${
      result.recommendations?.patientAdvisory?.vulnerableGroups?.join("; ") ||
      "None"
    }
Preventive Measures: ${
      result.recommendations?.patientAdvisory?.preventiveMeasures?.join("; ") ||
      "None"
    }

REASONING:
${result.recommendations?.reasoning || "N/A"}
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthcare-prediction-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading results...</p>
      </div>
    );
  }

  // Safely extract staffing data with defaults
  const currentStaffing = result.metadata?.inputs?.currentStaffing || {};
  const recommendedStaffing =
    result.recommendations?.staffingRecommendations || {};

  const staffingData = [
    {
      name: "Doctors",
      current: currentStaffing.doctors || 0,
      recommended: recommendedStaffing.doctors || currentStaffing.doctors || 0,
    },
    {
      name: "Nurses",
      current: currentStaffing.nurses || 0,
      recommended: recommendedStaffing.nurses || currentStaffing.nurses || 0,
    },
    {
      name: "Specialists",
      current: currentStaffing.specialists || 0,
      recommended:
        recommendedStaffing.specialists || currentStaffing.specialists || 0,
    },
    {
      name: "Support Staff",
      current: currentStaffing.supportStaff || 0,
      recommended:
        recommendedStaffing.supportStaff || currentStaffing.supportStaff || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/predict")}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Prediction</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Prediction Results
          </h1>
          <p className="text-gray-600">
            AI-generated recommendations for your scenario
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="card bg-blue-50 border-blue-200 border">
        <div className="flex items-start space-x-3">
          <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Scenario</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {result.metadata?.inputs?.festival && (
                <p>
                  Festival:{" "}
                  <span className="font-medium">
                    {result.metadata.inputs.festival}
                  </span>
                </p>
              )}
              {result.metadata?.inputs?.aqi && (
                <p>
                  AQI Level:{" "}
                  <span className="font-medium">
                    {result.metadata.inputs.aqi}
                  </span>
                </p>
              )}
              {result.metadata?.inputs?.epidemic && (
                <p>
                  Epidemic:{" "}
                  <span className="font-medium">
                    {result.metadata.inputs.epidemic}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Staffing Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {staffingData.map((item) => (
            <div
              key={item.name}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
            >
              <p className="text-sm font-medium text-gray-600 mb-2">
                {item.name}
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-blue-600">
                  {item.recommended}
                </span>
                {item.current !== item.recommended && (
                  <span className="text-sm text-gray-500">
                    (was {item.current})
                  </span>
                )}
              </div>
              {item.current !== item.recommended && (
                <p className="text-xs text-gray-600 mt-1">
                  {item.recommended > item.current ? "+" : ""}
                  {item.recommended - item.current} change
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staffingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#94a3b8" name="Current" />
              <Bar dataKey="recommended" fill="#3b82f6" name="Recommended" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {result.recommendations?.staffingRecommendations?.specialtyBreakdown &&
          Object.keys(
            result.recommendations.staffingRecommendations.specialtyBreakdown
          ).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Specialty Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(
                  result.recommendations.staffingRecommendations
                    .specialtyBreakdown
                ).map(([specialty, value]) => {
                  // Handle nested objects (e.g., doctors: { generalMedicine: 35, ... })
                  if (typeof value === "object" && value !== null) {
                    return Object.entries(value).map(
                      ([subSpecialty, count]) => (
                        <div
                          key={`${specialty}-${subSpecialty}`}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <p className="text-sm text-gray-600 capitalize">
                            {specialty}:{" "}
                            {subSpecialty.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {count}
                          </p>
                        </div>
                      )
                    );
                  }
                  // Handle simple values
                  return (
                    <div
                      key={specialty}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <p className="text-sm text-gray-600 capitalize">
                        {specialty.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Supply Recommendations
          </h2>
        </div>

        <div className="space-y-4">
          {result.recommendations?.supplyRecommendations?.critical?.length >
          0 ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Critical</h3>
              </div>
              <div className="space-y-2 ml-7">
                {result.recommendations.supplyRecommendations.critical.map(
                  (item, idx) => (
                    <div key={idx}>
                      {typeof item === "string" ? (
                        <p className="text-gray-700">{item}</p>
                      ) : (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                          <p className="font-medium text-gray-900">
                            {item.item}
                          </p>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            {(item.currentQuantity || item.currentQty) !==
                              undefined && (
                              <p>
                                Current:{" "}
                                {item.currentQuantity || item.currentQty}
                              </p>
                            )}
                            {item.recommendedAdditional !== undefined && (
                              <p>
                                Additional Needed: {item.recommendedAdditional}
                              </p>
                            )}
                            {item.targetQty !== undefined && (
                              <p>Target: {item.targetQty}</p>
                            )}
                            {(item.rationale || item.note) && (
                              <p className="text-gray-500 italic mt-1">
                                {item.rationale || item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}

          {result.recommendations?.supplyRecommendations?.essential?.length >
          0 ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Essential</h3>
              </div>
              <div className="space-y-2 ml-7">
                {result.recommendations.supplyRecommendations.essential.map(
                  (item, idx) => (
                    <div key={idx}>
                      {typeof item === "string" ? (
                        <p className="text-gray-700">{item}</p>
                      ) : (
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                          <p className="font-medium text-gray-900">
                            {item.item}
                          </p>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            {(item.currentQuantity || item.currentQty) !==
                              undefined && (
                              <p>
                                Current:{" "}
                                {item.currentQuantity || item.currentQty}
                              </p>
                            )}
                            {item.recommendedAdditional !== undefined && (
                              <p>
                                Additional Needed: {item.recommendedAdditional}
                              </p>
                            )}
                            {item.targetQty !== undefined && (
                              <p>Target: {item.targetQty}</p>
                            )}
                            {(item.rationale || item.note) && (
                              <p className="text-gray-500 italic mt-1">
                                {item.rationale || item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}

          {result.recommendations?.supplyRecommendations?.optional?.length >
          0 ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Optional</h3>
              </div>
              <div className="space-y-2 ml-7">
                {result.recommendations.supplyRecommendations.optional.map(
                  (item, idx) => (
                    <div key={idx}>
                      {typeof item === "string" ? (
                        <p className="text-gray-700">{item}</p>
                      ) : (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="font-medium text-gray-900">
                            {item.item}
                          </p>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            {(item.currentQuantity || item.currentQty) !==
                              undefined && (
                              <p>
                                Current:{" "}
                                {item.currentQuantity || item.currentQty}
                              </p>
                            )}
                            {item.recommendedAdditional !== undefined && (
                              <p>
                                Additional Needed: {item.recommendedAdditional}
                              </p>
                            )}
                            {item.targetQty !== undefined && (
                              <p>Target: {item.targetQty}</p>
                            )}
                            {item.recommended !== undefined && (
                              <p>Recommended: {item.recommended}</p>
                            )}
                            {item.recommendedQuantity !== undefined && (
                              <p>
                                Recommended Quantity: {item.recommendedQuantity}
                              </p>
                            )}
                            {(item.rationale || item.note) && (
                              <p className="text-gray-500 italic mt-1">
                                {item.rationale || item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}

          {!result.recommendations?.supplyRecommendations?.critical?.length &&
            !result.recommendations?.supplyRecommendations?.essential?.length &&
            !result.recommendations?.supplyRecommendations?.optional
              ?.length && (
              <p className="text-gray-500 text-center py-4">
                No supply recommendations available
              </p>
            )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Advisories
          </h2>
        </div>

        <div className="space-y-4">
          {result.recommendations?.patientAdvisory?.generalPublic?.length >
          0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                General Public
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {result.recommendations.patientAdvisory.generalPublic.map(
                  (item, idx) => (
                    <li key={idx} className="text-gray-700">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          {result.recommendations?.patientAdvisory?.vulnerableGroups?.length >
          0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Vulnerable Groups
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {result.recommendations.patientAdvisory.vulnerableGroups.map(
                  (item, idx) => (
                    <li key={idx} className="text-gray-700">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          {result.recommendations?.patientAdvisory?.preventiveMeasures?.length >
          0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Preventive Measures
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {result.recommendations.patientAdvisory.preventiveMeasures.map(
                  (item, idx) => (
                    <li key={idx} className="text-gray-700">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          {!result.recommendations?.patientAdvisory?.generalPublic?.length &&
            !result.recommendations?.patientAdvisory?.vulnerableGroups
              ?.length &&
            !result.recommendations?.patientAdvisory?.preventiveMeasures
              ?.length && (
              <p className="text-gray-500 text-center py-4">
                No patient advisories available
              </p>
            )}
        </div>
      </div>

      {result.recommendations?.reasoning && (
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-start space-x-3 mb-3">
            <FileText className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-semibold text-gray-900">
              AI Reasoning
            </h2>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.recommendations.reasoning}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        <button onClick={() => navigate("/predict")} className="btn-primary">
          Make Another Prediction
        </button>
        <button onClick={() => navigate("/")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
