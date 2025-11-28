import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Upload,
  Trash2,
  RefreshCw,
  FileText,
  AlertCircle,
  Database,
} from "lucide-react";
import { knowledgeAPI } from "../services/api";

const KnowledgeBase = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await knowledgeAPI.getAllEntries();
      setEntries(response.data.entries || []);
    } catch (error) {
      showMessage("error", "Failed to fetch entries");
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitManual = async (data) => {
    try {
      await knowledgeAPI.addEntry(data);
      showMessage("success", "Entry added successfully");
      reset();
      setShowAddForm(false);
      fetchEntries();
    } catch (error) {
      showMessage("error", "Failed to add entry");
      console.error("Error adding entry:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await knowledgeAPI.uploadFile(file, (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      });

      showMessage("success", "File uploaded and processed successfully");
      fetchEntries();
    } catch (error) {
      showMessage("error", "Failed to upload file");
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await knowledgeAPI.deleteEntry(id);
      showMessage("success", "Entry deleted successfully");
      fetchEntries();
    } catch (error) {
      showMessage("error", "Failed to delete entry");
      console.error("Error deleting entry:", error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Knowledge Base
          </h1>
          <p className="text-gray-600">
            Manage your healthcare knowledge entries and upload documents
          </p>
        </div>
        <button
          onClick={fetchEntries}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <AlertCircle className="h-5 w-5" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Entry Manually</span>
        </button>

        <label className="btn-secondary flex items-center justify-center space-x-2 cursor-pointer">
          <Upload className="h-5 w-5" />
          <span>Upload File (PDF/CSV/Excel)</span>
          <input
            type="file"
            accept=".pdf,.csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-primary-600 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Uploading and processing file...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add Knowledge Entry
          </h3>
          <form onSubmit={handleSubmit(onSubmitManual)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Festival/Event</label>
                <input
                  type="text"
                  {...register("festival")}
                  className="input-field"
                  placeholder="e.g., Diwali, Holi"
                />
              </div>

              <div>
                <label className="label">AQI Level</label>
                <input
                  type="text"
                  {...register("aqi")}
                  className="input-field"
                  placeholder="e.g., High (151-200)"
                />
              </div>

              <div>
                <label className="label">Season</label>
                <input
                  type="text"
                  {...register("season")}
                  className="input-field"
                  placeholder="e.g., Autumn/Winter"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Health Impact <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("healthImpact", {
                  required: "Health impact is required",
                })}
                className="input-field"
                rows="3"
                placeholder="Describe the health impacts..."
              />
              {errors.healthImpact && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.healthImpact.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Recommended Staffing</label>
              <textarea
                {...register("recommendedStaffing")}
                className="input-field"
                rows="2"
                placeholder="e.g., Increase emergency staff by 30%..."
              />
            </div>

            <div>
              <label className="label">Required Supplies</label>
              <textarea
                {...register("requiredSupplies")}
                className="input-field"
                rows="2"
                placeholder="e.g., Respiratory medications, burn kits..."
              />
            </div>

            <div>
              <label className="label">Patient Advisory</label>
              <textarea
                {...register("patientAdvisory")}
                className="input-field"
                rows="2"
                placeholder="e.g., Avoid firecracker exposure..."
              />
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Add Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  reset();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Knowledge Entries ({entries.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No knowledge entries yet</p>
            <p className="text-sm text-gray-400">
              Add entries manually or upload a document to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Festival/Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    AQI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Season
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Health Impact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.festival || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.aqi || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.season || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                      {entry.healthImpact}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
