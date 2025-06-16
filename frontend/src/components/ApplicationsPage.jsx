import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Building,
  MapPin,
  DollarSign,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  ExternalLink,
  TrendingUp,
  Users,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import AddApplicationModal from './AddApplicationModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for demo
  const mockApplications = [
    {
      id: 'app_1',
      jobTitle: 'Senior Product Manager - AI/ML',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$180k - $250k',
      status: 'submitted',
      appliedDate: '2025-06-15T10:30:00Z',
      source: 'LinkedIn',
      jobUrl: 'https://linkedin.com/jobs/123',
      coverLetterGenerated: true,
      resumeCustomized: true,
      notes: 'Referred by John Doe from the AI team',
      lastUpdate: '2025-06-15T10:30:00Z'
    },
    {
      id: 'app_2',
      jobTitle: 'Principal Product Manager - Voice AI',
      company: 'Amazon',
      location: 'Seattle, WA',
      salary: '$200k - $280k',
      status: 'interview',
      appliedDate: '2025-06-12T14:20:00Z',
      source: 'Company Website',
      jobUrl: 'https://amazon.jobs/456',
      coverLetterGenerated: true,
      resumeCustomized: true,
      notes: 'Phone screen scheduled for June 18th',
      lastUpdate: '2025-06-16T09:15:00Z',
      interviewDate: '2025-06-18T15:00:00Z'
    },
    {
      id: 'app_3',
      jobTitle: 'VP of Product - Automotive',
      company: 'Tesla',
      location: 'Austin, TX',
      salary: '$250k - $350k',
      status: 'response',
      appliedDate: '2025-06-10T09:00:00Z',
      source: 'Referral',
      jobUrl: 'https://tesla.com/careers/789',
      coverLetterGenerated: true,
      resumeCustomized: true,
      notes: 'HR reached out for initial discussion',
      lastUpdate: '2025-06-14T16:45:00Z'
    },
    {
      id: 'app_4',
      jobTitle: 'Senior PM - Machine Learning Platform',
      company: 'Meta',
      location: 'Menlo Park, CA',
      salary: '$170k - $240k',
      status: 'rejected',
      appliedDate: '2025-06-08T11:15:00Z',
      source: 'Indeed',
      jobUrl: 'https://meta.com/careers/012',
      coverLetterGenerated: true,
      resumeCustomized: false,
      notes: 'Position filled internally',
      lastUpdate: '2025-06-13T10:00:00Z'
    },
    {
      id: 'app_5',
      jobTitle: 'Director of Product Strategy',
      company: 'OpenAI',
      location: 'San Francisco, CA',
      salary: '$220k - $300k',
      status: 'submitted',
      appliedDate: '2025-06-14T16:45:00Z',
      source: 'AngelList',
      jobUrl: 'https://openai.com/careers/345',
      coverLetterGenerated: true,
      resumeCustomized: true,
      notes: 'Dream job - AI product strategy role',
      lastUpdate: '2025-06-14T16:45:00Z'
    }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // For demo, use mock data
      // In production: const response = await axios.get(`${API}/users/${user.id}/applications`);
      setApplications(mockApplications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications(mockApplications); // Fallback to mock data
      setLoading(false);
    }
  };

  const handleAddApplication = async (newApplication) => {
    try {
      // In production, this would be an API call
      // await axios.post(`${API}/users/${user.id}/applications`, newApplication);
      
      // For demo, add to local state
      setApplications(prev => [newApplication, ...prev]);
      
      toast({
        title: "Application Added",
        description: `Application for ${newApplication.jobTitle} at ${newApplication.company} has been added.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'response':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'interview':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'offer':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'response':
        return 'bg-green-100 text-green-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'offer':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'response':
        return 'Response';
      case 'interview':
        return 'Interview';
      case 'rejected':
        return 'Rejected';
      case 'offer':
        return 'Offer';
      default:
        return 'Unknown';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.appliedDate) - new Date(a.appliedDate);
      case 'oldest':
        return new Date(a.appliedDate) - new Date(b.appliedDate);
      case 'company':
        return a.company.localeCompare(b.company);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const stats = {
    total: applications.length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    responses: applications.filter(app => ['response', 'interview', 'offer'].includes(app.status)).length,
    interviews: applications.filter(app => app.status === 'interview').length
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Track your job application progress</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Responses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="response">Response</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="offer">Offer</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {sortedApplications.length > 0 ? (
          sortedApplications.map((application) => (
            <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {application.company.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{application.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{application.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{application.salary}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <Badge className={`${getStatusColor(application.status)} border-0`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(application.status)}
                              <span>{getStatusText(application.status)}</span>
                            </div>
                          </Badge>
                          
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {application.source}
                          </Badge>
                        </div>

                        {application.notes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            {application.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(application.jobUrl, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Job Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start tracking your job applications by adding your first application.'
                }
              </p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddApplication}
      />
    </div>
  );
};

export default ApplicationsPage;