import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LineChart, Loader, AlertCircle, Plus, Minus } from 'lucide-react';
import { predictionAPI } from '../services/api';

const Prediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Supply inventory state with default values
  const [supplies, setSupplies] = useState({
    masks: 1000,
    gloves: 5000,
    ventilators: 20,
    oxygenCylinders: 100,
    respiratoryMeds: 500,
    ivFluids: 1000,
    antibiotics: 800,
    syringes: 2000,
    bandages: 3000,
    sanitizers: 500,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      festival: '',
      aqi: '',
      epidemic: '',
      doctors: 50,
      nurses: 120,
      specialists: 30,
      supportStaff: 80,
    }
  });

  // Handle supply quantity changes
  const updateSupply = (key, value) => {
    setSupplies(prev => ({
      ...prev,
      [key]: Math.max(0, value), // Ensure non-negative values
    }));
  };

  const incrementSupply = (key, step = 1) => {
    setSupplies(prev => ({
      ...prev,
      [key]: prev[key] + step,
    }));
  };

  const decrementSupply = (key, step = 1) => {
    setSupplies(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] - step), // Don't go below 0
    }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const predictionData = {
        festival: data.festival || null,
        aqi: data.aqi || null,
        epidemic: data.epidemic || null,
        currentStaffing: {
          doctors: parseInt(data.doctors),
          nurses: parseInt(data.nurses),
          specialists: parseInt(data.specialists),
          supportStaff: parseInt(data.supportStaff),
        },
        currentSupply: supplies, // Use the supplies state directly
      };

      const response = await predictionAPI.predict(predictionData);

      // Store the result and navigate to results page
      localStorage.setItem('predictionResult', JSON.stringify(response.data));
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const aqiOptions = [
    'Normal (0-50)',
    'Moderate (51-100)',
    'Unhealthy for Sensitive Groups (101-150)',
    'High (151-200)',
    'Very High (201-300)',
    'Hazardous (300+)',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Make Prediction</h1>
        <p className="text-gray-600">
          Enter scenario details and current resources to get AI-powered recommendations
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenario Details</h2>
          <p className="text-sm text-gray-600 mb-4">
            Specify at least one scenario factor (festival, AQI, or epidemic)
          </p>

          <div className="space-y-4">
            <div>
              <label className="label">Festival or Event</label>
              <input
                type="text"
                {...register('festival')}
                className="input-field"
                placeholder="e.g., Diwali, Holi, Monsoon Season"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if not applicable
              </p>
            </div>

            <div>
              <label className="label">Air Quality Index (AQI) Level</label>
              <select
                {...register('aqi')}
                className="input-field"
              >
                <option value="">Select AQI Level</option>
                {aqiOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Epidemic or Disease Outbreak</label>
              <input
                type="text"
                {...register('epidemic')}
                className="input-field"
                placeholder="e.g., COVID-19, Dengue, Malaria"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if not applicable
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Staffing Levels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Doctors <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('doctors', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                })}
                className="input-field"
              />
              {errors.doctors && (
                <p className="text-red-500 text-sm mt-1">{errors.doctors.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                Nurses <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('nurses', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                })}
                className="input-field"
              />
              {errors.nurses && (
                <p className="text-red-500 text-sm mt-1">{errors.nurses.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                Specialists <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('specialists', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                })}
                className="input-field"
              />
              {errors.specialists && (
                <p className="text-red-500 text-sm mt-1">{errors.specialists.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                Support Staff <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('supportStaff', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be positive' }
                })}
                className="input-field"
              />
              {errors.supportStaff && (
                <p className="text-red-500 text-sm mt-1">{errors.supportStaff.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Supply Inventory
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Adjust supply quantities using the +/- buttons or enter values directly
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(supplies).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => decrementSupply(key, key === 'masks' || key === 'gloves' || key === 'syringes' || key === 'bandages' ? 100 : key === 'ventilators' ? 1 : 10)}
                    className="p-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                    title="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateSupply(key, parseInt(e.target.value) || 0)}
                    className="w-20 text-center border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => incrementSupply(key, key === 'masks' || key === 'gloves' || key === 'syringes' || key === 'bandages' ? 100 : key === 'ventilators' ? 1 : 10)}
                    className="p-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
                    title="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Tip: Use +/- buttons for quick adjustments. Step size varies by item type.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 flex-1 justify-center"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Generating Prediction...</span>
              </>
            ) : (
              <>
                <LineChart className="h-5 w-5" />
                <span>Generate Prediction</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Prediction;
