import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Send,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Debug logging
console.log('Dashboard - BACKEND_URL:', BACKEND_URL);
console.log('Dashboard - API:', API);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Aniket's user ID from the test
  const userId = '7db1f025-21f6-4737-a7a0-0c92c0581d71';

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const dashboardResponse = await axios.get(`${API}/users/${userId}/dashboard`);
      setDashboardData(dashboardResponse.data);

      // Fetch active jobs
      const jobsResponse = await axios.get(`${API}/jobs`);
      setJobs(jobsResponse.data.slice(0, 3)); // Show top 3

      // Fetch campaigns
      const campaignsResponse = await axios.get(`${API}/users/${userId}/campaigns`);
      setCampaigns(campaignsResponse.data.filter(c => c.status === 'active'));

      // Fetch recent applications
      const applicationsResponse = await axios.get(`${API}/users/${userId}/applications`);
      setApplications(applicationsResponse.data.slice(0, 3)); // Show latest 3

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Warning",
        description: "Unable to fetch live data. Showing demo data.",
        variant: "default",
      });
      
      // Fallback to demo data
      setDashboardData({
        total_applications: 31,
        response_rate: 12.9,
        interview_rate: 6.5,
        avg_response_time: 3.2,
        week_change_percent: 12.0,
        applications_by_day: [
          { date: '2025-06-10', count: 5 },
          { date: '2025-06-11', count: 3 },
          { date: '2025-06-12', count: 7 },
          { date: '2025-06-13', count: 4 },
          { date: '2025-06-14', count: 6 },
          { date: '2025-06-15', count: 6 }
        ],
        top_performing_keywords: ['Product Manager', 'Growth', 'B2C']
      });
      
      setJobs([
        {
          id: '1',
          title: 'Senior Product Manager',
          company: 'Meta',
          location: 'San Francisco, CA',
          salary: '$180k - $220k',
          posted_at: new Date().toISOString(),
          application_deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'monitoring',
          match_score: 92,
          urgency: 'high'
        }
      ]);
      
      setCampaigns([
        {
          id: '1',
          name: 'Senior Product Manager - Tech',
          status: 'active',
          applications_submitted: 23,
          responses: 4,
          interviews: 2
        }
      ]);
      
      setApplications([
        {
          id: '1',
          job_id: '1',
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          ai_confidence: 0.91
        }
      ]);
      
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'monitoring': return 'bg-blue-500';
      case 'applied': return 'bg-green-500';
      case 'customizing': return 'bg-purple-500';
      case 'response_received': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const timeUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours <= 0 && minutes <= 0) return 'Expired';
    if (hours <= 0) return `${minutes}m left`;
    return `${hours}h ${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold">{dashboardData?.total_applications || 0}</p>
                <p className="text-blue-100 text-xs mt-1 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +{dashboardData?.week_change_percent || 0}% this week
                </p>
              </div>
              <Send className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Response Rate</p>
                <p className="text-3xl font-bold">{dashboardData?.response_rate || 0}%</p>
                <p className="text-green-100 text-xs mt-1 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +2.3% vs avg
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Interview Rate</p>
                <p className="text-3xl font-bold">{dashboardData?.interview_rate || 0}%</p>
                <p className="text-purple-100 text-xs mt-1 flex items-center">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  -0.5% this week
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg Response Time</p>
                <p className="text-3xl font-bold">{dashboardData?.avg_response_time || 0}d</p>
                <p className="text-orange-100 text-xs mt-1 flex items-center">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  Faster than avg
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Hot Jobs (3h window)</CardTitle>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {jobs.length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                    <p className="text-sm font-medium text-green-600">{job.salary}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getUrgencyColor(job.urgency)}`} />
                    <Badge variant="outline" className="text-xs">
                      {job.match_score}% match
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Posted: {new Date(job.posted_at).toLocaleTimeString()}</span>
                  <span className="font-medium text-red-600">
                    {timeUntilDeadline(job.application_deadline)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={`text-white ${getStatusColor(job.status)}`}
                  >
                    {job.status === 'monitoring' ? 'Monitoring' : job.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{campaign.applications_submitted}</p>
                    <p className="text-xs text-gray-500">Applied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{campaign.responses}</p>
                    <p className="text-xs text-gray-500">Responses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{campaign.interviews}</p>
                    <p className="text-xs text-gray-500">Interviews</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Rate</span>
                    <span className="font-medium">
                      {campaign.applications_submitted > 0 ? 
                        ((campaign.responses / campaign.applications_submitted) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={campaign.applications_submitted > 0 ? 
                      (campaign.responses / campaign.applications_submitted) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => {
              const job = jobs.find(j => j.id === app.job_id);
              return (
                <div key={app.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${getStatusColor(app.status)} flex items-center justify-center`}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job?.title || 'Job Application'}</h4>
                    <p className="text-sm text-gray-600">{job?.company || 'Company'}</p>
                    <p className="text-xs text-gray-500">
                      Applied {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary" 
                      className={`text-white ${getStatusColor(app.status)}`}
                    >
                      {app.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      AI Confidence: {(app.ai_confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;