import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Eye, 
  Bot,
  Brain,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { fraudAPI, reviewsAPI } from '../services/api';

const FraudDetection = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mlModels, setMlModels] = useState([]);
  const [fraudData, setFraudData] = useState({
    stats: {
      detectionRate: 0,
      reviewsScanned: 0,
      fraudDetected: 0,
      falsePositives: 0,
      averageResponseTime: '0 minutes'
    },
    detectedFraud: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        const [fraudReports, reviews] = await Promise.all([
          fraudAPI.getAll(),
          reviewsAPI.getAll()
        ]);

        const stats = {
          detectionRate: 0,
          reviewsScanned: reviews.length,
          fraudDetected: fraudReports.length,
          falsePositives: 0,
          averageResponseTime: '0 minutes'
        };

        setFraudData({
          stats,
          detectedFraud: fraudReports.map(report => ({
            id: report._id,
            type: report.type,
            description: report.description,
            riskScore: report.riskScore,
            status: report.status,
            detectedBy: report.detectedBy,
            affectedReviews: report.affectedReviews,
            timestamp: report.createdAt,
            evidence: report.evidence || []
          })),
          loading: false
        });
      } catch (error) {
        console.error('Error fetching fraud data:', error);
        setFraudData(prev => ({ 
          ...prev, 
          loading: false,
          error: 'Unable to connect to the server. Please check if the backend is running.'
        }));
      }
    };

    fetchFraudData();
  }, []);

  if (fraudData.loading) {
    return (
      <div className="flex-1">
        <Navbar 
          title="Fraud Detection Center"
          subtitle="Advanced threat monitoring and analysis"
          icon={Shield}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fraud detection data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (fraudData.error) {
    return (
      <div className="flex-1">
        <Navbar 
          title="Fraud Detection Center"
          subtitle="Advanced threat monitoring and analysis"
          icon={Shield}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{fraudData.error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score >= 9) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-red-600 bg-red-50';
      case 'investigating': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'dismissed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getModelStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'training': return 'text-blue-600 bg-blue-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="text-green-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm">Detection Rate</p>
            <p className="text-2xl font-bold text-green-600">{fraudData.stats.detectionRate}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="text-blue-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm">Reviews Scanned</p>
            <p className="text-2xl font-bold text-blue-600">{fraudData.stats.reviewsScanned.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm">Fraud Detected</p>
            <p className="text-2xl font-bold text-red-600">{fraudData.stats.fraudDetected}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="text-yellow-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm">False Positives</p>
            <p className="text-2xl font-bold text-yellow-600">{fraudData.stats.falsePositives}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-purple-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm">Avg Response</p>
            <p className="text-2xl font-bold text-purple-600">{fraudData.stats.averageResponseTime}</p>
          </div>
        </div>
      </div>

      {/* Recent Detections */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Recent Fraud Detections</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Latest fraud attempts detected by our AI systems</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {fraudData.detectedFraud.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Fraud Detected</h3>
                <p className="text-gray-500">No fraudulent activities have been detected at this time.</p>
              </div>
            ) : (
              fraudData.detectedFraud.map((fraud) => (
              <div key={fraud.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{fraud.type}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(fraud.riskScore)}`}>
                          Risk: {fraud.riskScore}/10
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fraud.status)}`}>
                          {fraud.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{fraud.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Detected by:</span>
                          <span className="ml-2 text-gray-800">{fraud.detectedBy}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Affected Reviews:</span>
                          <span className="ml-2 text-gray-800">{fraud.affectedReviews}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Timestamp:</span>
                          <span className="ml-2 text-gray-800">{formatDate(fraud.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Evidence:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {fraud.evidence.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                      Take Action
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMLModels = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mlModels.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ML Models Configured</h3>
            <p className="text-gray-500">No machine learning models have been configured for fraud detection.</p>
          </div>
        ) : (
          mlModels.map((model) => (
          <div key={model.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelStatusColor(model.status)}`}>
                {model.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{model.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accuracy:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${model.accuracy}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{model.accuracy}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Detections:</span>
                <span className="font-medium text-gray-800">{model.detections.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-800">{model.lastUpdated}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                <Bot size={14} />
                <span>Configure</span>
              </button>
              <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                View Logs
              </button>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1">
      <Navbar 
        title="Fraud Detection"
        subtitle="AI-powered fraud detection and prevention system"
        icon={AlertTriangle}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Threats</p>
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-gray-600 text-xs mt-1">No active threats</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Prevention Rate</p>
                <p className="text-2xl font-bold text-gray-800">0%</p>
                <p className="text-gray-600 text-xs mt-1">No data available</p>
              </div>
              <Shield className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">ML Models Active</p>
                <p className="text-2xl font-bold text-gray-800">{mlModels.length}</p>
                <p className="text-gray-600 text-xs mt-1">Models configured</p>
              </div>
              <Brain className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Processing Speed</p>
                <p className="text-2xl font-bold text-gray-800">0s</p>
                <p className="text-gray-600 text-xs mt-1">Per review analysis</p>
              </div>
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Detection Dashboard
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'models' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ML Models
              </button>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'models' && renderMLModels()}
      </div>
    </div>
  );
};

export default FraudDetection;
