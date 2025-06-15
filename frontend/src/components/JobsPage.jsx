import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  DollarSign,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle,
  Bot,
  TestTube
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import AITestingModal from './AITestingModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    // Set up polling for real-time updates
    const interval = setInterval(fetchJobs, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Show sample data if API fails
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
          urgency: 'high',
          description: 'Lead product strategy for our core social platform...',
          requirements: ['5+ years PM experience', 'B2C product experience', 'Data-driven approach']
        },
        {
          id: '2',
          title: 'Product Manager - Growth',
          company: 'Stripe',
          location: 'Remote',
          salary: '$160k - $200k',
          posted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          application_deadline: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
          status: 'monitoring',
          match_score: 88,
          urgency: 'medium',
          description: 'Drive growth initiatives across our payment platform...',
          requirements: ['3+ years PM experience', 'Growth/experimentation background', 'Technical aptitude']
        }
      ]);
      setLoading(false);
    }
  };

  const handleApplyToJob = async (jobId) => {
    try {
      await axios.post(`${API}/jobs/${jobId}/apply`);
      toast({
        title: "Application Submitted!",
        description: "Job application has been successfully submitted.",
      });
      fetchJobs(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
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

  const handleTestAI = (job) => {
    setSelectedJob(job);
    setShowAIModal(true);
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'critical') return job.urgency === 'critical';
    if (filter === 'applied') return job.status === 'applied';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hot Jobs</h1>
          <p className="text-gray-600 mt-1">Critical 3-hour application window opportunities</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live monitoring</span>
          </div>
          <Button onClick={fetchJobs} variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Jobs', count: jobs.length },
            { key: 'critical', label: 'Critical', count: jobs.filter(j => j.urgency === 'critical').length },
            { key: 'applied', label: 'Applied', count: jobs.filter(j => j.status === 'applied').length }
          ].map(filter_option => (
            <Button
              key={filter_option.key}
              variant={filter === filter_option.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filter_option.key)}
              className="flex items-center space-x-2"
            >
              <span>{filter_option.label}</span>
              <Badge variant="secondary" className="ml-2">
                {filter_option.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(job.urgency)}`} />
                    <Badge variant="outline" className="text-xs">
                      {job.match_score}% match
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium text-green-600">{job.salary}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-white ${getStatusColor(job.status)}`}
                  >
                    {job.status === 'monitoring' ? 'Live' : job.status}
                  </Badge>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Posted: {new Date(job.posted_at).toLocaleTimeString()}</span>
                    </div>
                    <div className={`text-sm font-medium ${
                      job.urgency === 'critical' ? 'text-red-600' :
                      job.urgency === 'high' ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {timeUntilDeadline(job.application_deadline)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {job.urgency === 'critical' && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Critical Window!</span>
                    </div>
                  )}
                  {job.status === 'applied' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Applied</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                  
                  <Button 
                    onClick={() => handleTestAI(job)}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Test AI
                  </Button>
                  
                  {job.status === 'monitoring' && (
                    <Button 
                      onClick={() => handleApplyToJob(job.id)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "No active jobs are currently being monitored." 
                : `No jobs match the "${filter}" filter.`}
            </p>
            <Button onClick={() => setFilter('all')} className="mt-4" variant="outline">
              Show all jobs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Testing Modal */}
      <AITestingModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default JobsPage;