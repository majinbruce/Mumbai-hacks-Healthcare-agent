import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, LineChart, FileText, TrendingUp, Clock } from 'lucide-react';
import { knowledgeAPI, predictionAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalPredictions: 0,
    loading: true,
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentPredictions();
  }, []);

  const fetchStats = async () => {
    try {
      const knowledgeResponse = await knowledgeAPI.getAllEntries(1, 0);
      const predictionsResponse = await predictionAPI.getAllPredictions(1, 0);

      setStats({
        totalEntries: knowledgeResponse.data.count || 0,
        totalPredictions: predictionsResponse.data.count || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ totalEntries: 0, totalPredictions: 0, loading: false });
    }
  };

  const fetchRecentPredictions = async () => {
    try {
      const response = await predictionAPI.getAllPredictions(5, 0);
      setRecentPredictions(response.data.predictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setRecentPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const statCards = [
    {
      title: 'Total Knowledge Entries',
      value: stats.loading ? '...' : stats.totalEntries,
      icon: Database,
      color: 'bg-blue-500',
      description: 'Knowledge base entries',
    },
    {
      title: 'Predictions Made',
      value: stats.loading ? '...' : stats.totalPredictions,
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'AI-powered predictions',
    },
    {
      title: 'Data Sources',
      value: '3',
      icon: FileText,
      color: 'bg-purple-500',
      description: 'PDF, CSV, Excel',
    },
  ];

  const quickActions = [
    {
      title: 'Add Knowledge',
      description: 'Manually add or upload healthcare knowledge',
      icon: Database,
      link: '/knowledge',
      color: 'primary',
    },
    {
      title: 'Make Prediction',
      description: 'Generate staffing and supply recommendations',
      icon: LineChart,
      link: '/predict',
      color: 'medical',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the Healthcare Resource Planning System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="card hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-primary-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`bg-${action.color}-500 p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {recentPredictions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Predictions</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>

          {loadingPredictions ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : (
            <div className="space-y-3">
              {recentPredictions.map((prediction, index) => (
                <div key={prediction.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {prediction.metadata?.inputs?.festival && (
                          <span className="text-sm font-medium text-primary-600">
                            {prediction.metadata.inputs.festival}
                          </span>
                        )}
                        {prediction.metadata?.inputs?.aqi && (
                          <span className="text-sm text-gray-600">
                            AQI: {prediction.metadata.inputs.aqi}
                          </span>
                        )}
                        {prediction.metadata?.inputs?.epidemic && (
                          <span className="text-sm font-medium text-red-600">
                            {prediction.metadata.inputs.epidemic}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(prediction.metadata?.timestamp || prediction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Staff: {prediction.metadata?.inputs?.currentStaffing?.doctors || 0}D / {prediction.metadata?.inputs?.currentStaffing?.nurses || 0}N</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          About Healthcare Agent
        </h2>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-3">
            This system helps hospitals plan resources by analyzing factors like:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Festivals and seasonal events (e.g., Diwali, Monsoon)</li>
            <li>Air Quality Index (AQI) levels and their health impacts</li>
            <li>Epidemic outbreaks (e.g., Dengue, COVID-19)</li>
          </ul>
          <p className="mt-4">
            Upload historical data or add entries manually to build your
            knowledge base, then use AI-powered predictions to optimize staffing
            and supplies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
