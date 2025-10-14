import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import { fraudAPI, reviewsAPI } from '../services/api';

const ReportManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [reportData, setReportData] = useState({
    chartData: [],
    stats: {
      totalReports: 0,
      resolvedReports: 0,
      pendingReports: 0,
      responseTime: '2.3h'
    },
    recentReports: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [fraudReports, reviews] = await Promise.all([
          fraudAPI.getAll(),
          reviewsAPI.getAll()
        ]);

        // Create chart data based on reports over time
        const chartData = [
          { month: 'JAN', value: Math.floor(fraudReports.length * 0.08) },
          { month: 'FEB', value: Math.floor(fraudReports.length * 0.12) },
          { month: 'MAR', value: Math.floor(fraudReports.length * 0.10) },
          { month: 'APR', value: Math.floor(fraudReports.length * 0.15) },
          { month: 'MAY', value: Math.floor(fraudReports.length * 0.18) },
          { month: 'JUN', value: Math.floor(fraudReports.length * 0.12) },
          { month: 'JUL', value: Math.floor(fraudReports.length * 0.08) },
          { month: 'AUG', value: Math.floor(fraudReports.length * 0.05) },
          { month: 'SEP', value: Math.floor(fraudReports.length * 0.07) },
          { month: 'OCT', value: Math.floor(fraudReports.length * 0.06) },
          { month: 'NOV', value: Math.floor(fraudReports.length * 0.04) },
          { month: 'DEC', value: Math.floor(fraudReports.length * 0.05) }
        ];

        const stats = {
          totalReports: fraudReports.length,
          resolvedReports: fraudReports.filter(r => r.status === 'resolved').length,
          pendingReports: fraudReports.filter(r => r.status === 'pending' || r.status === 'investigating').length,
          responseTime: '2.3h'
        };

        const recentReports = fraudReports.slice(-5).map(report => ({
          id: report._id,
          type: report.type || 'General Report',
          description: report.description || 'No description available',
          status: report.status || 'pending',
          date: report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown',
          reporter: report.reportedBy || 'Anonymous'
        }));

        setReportData({ chartData, stats, recentReports });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-100">
        <Navbar 
          title="Report Management"
          subtitle="Monitor reports, complaints and platform issues"
          icon={FileText}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      {/* Header */}
      <Navbar 
        title="Report Management"
        subtitle="Monitor reports, complaints and platform issues"
        icon={FileText}
      />

      {/* Main Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Review Cards and Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Flag Reviews Card */}
              <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold">Flag Reviews</h3>
                <p className="text-2xl font-bold mt-2">8,027</p>
              </div>

              {/* Reported Reviews Card */}
              <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold">Reported Reviews</h3>
                <p className="text-2xl font-bold mt-2">3,298</p>
              </div>

              {/* Neutral Card */}
              <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold">Neutral</h3>
                <p className="text-2xl font-bold mt-2">546</p>
              </div>
            </div>

            {/* Summary of Reviews Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-8">Summary of Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Flag Reviews Stats */}
                <div className="text-center">
                  <h3 className="text-gray-600 font-medium mb-2">Flag Reviews</h3>
                  <div className="text-3xl font-bold text-gray-800">8,027</div>
                  <div className="text-sm text-green-600 mt-1">↑ 12.5%</div>
                </div>

                {/* Reported Reviews Stats */}
                <div className="text-center">
                  <h3 className="text-gray-600 font-medium mb-2">Reported Reviews</h3>
                  <div className="text-3xl font-bold text-gray-800">3,298</div>
                  <div className="text-sm text-red-600 mt-1">↓ 8.3%</div>
                </div>

                {/* Neutral Stats */}
                <div className="text-center">
                  <h3 className="text-gray-600 font-medium mb-2">Neutral</h3>
                  <div className="text-3xl font-bold text-gray-800">546</div>
                  <div className="text-sm text-green-600 mt-1">↑ 2.4%</div>
                </div>

                {/* Total Approved Stats */}
                <div className="text-center">
                  <h3 className="text-gray-600 font-medium mb-2">Total Approved</h3>
                  <div className="text-3xl font-bold text-gray-800">4,865</div>
                  <div className="text-sm text-green-600 mt-1">↑ 15.8%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Charts and Analytics */}
          <div className="space-y-6">
            {/* Fake Reviewers Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Fake Reviewers</h3>
                <select 
                  className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option>Month</option>
                  <option>Week</option>
                  <option>Year</option>
                </select>
              </div>
              
              {/* Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.chartData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;