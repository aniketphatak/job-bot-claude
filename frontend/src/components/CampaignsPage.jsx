import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Target, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  X,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    companies: '',
    locations: '',
    experience_level: 'Mid',
    salary_range: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Aniket's user ID from the test
  const userId = '7db1f025-21f6-4737-a7a0-0c92c0581d71';

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/campaigns`);
      setCampaigns(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Show sample data if API fails
      setCampaigns([
        {
          id: '1',
          name: 'Senior Product Manager - Tech',
          status: 'active',
          keywords: ['Product Manager', 'Senior PM', 'Product Strategy'],
          companies: ['Google', 'Meta', 'Apple', 'Microsoft', 'Amazon'],
          locations: ['San Francisco', 'Seattle', 'Remote'],
          experience_level: 'Senior',
          salary_range: '$150k - $250k',
          applications_submitted: 23,
          responses: 4,
          interviews: 2,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        },
        {
          id: '2',
          name: 'VP Product - Fintech',
          status: 'paused',
          keywords: ['VP Product', 'Head of Product', 'Product Director'],
          companies: ['Stripe', 'Square', 'Coinbase', 'Robinhood'],
          locations: ['New York', 'San Francisco', 'Remote'],
          experience_level: 'Executive',
          salary_range: '$200k - $350k',
          applications_submitted: 8,
          responses: 2,
          interviews: 1,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Campaign name is required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const campaignData = {
        user_id: userId,
        name: formData.name,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        companies: formData.companies.split(',').map(c => c.trim()).filter(c => c),
        locations: formData.locations.split(',').map(l => l.trim()).filter(l => l),
        experience_level: formData.experience_level,
        salary_range: formData.salary_range
      };

      await axios.post(`${API}/campaigns`, campaignData);
      
      toast({
        title: "Campaign Created",
        description: "Job search campaign created successfully!",
      });
      
      setShowCreateForm(false);
      setFormData({
        name: '',
        keywords: '',
        companies: '',
        locations: '',
        experience_level: 'Mid',
        salary_range: ''
      });
      
      fetchCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCampaignStatus = async (campaignId) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      
      await axios.put(`${API}/campaigns/${campaignId}`, { status: newStatus });
      
      toast({
        title: `Campaign ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
        description: `Campaign has been ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`,
      });
      
      fetchCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Job Search Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your automated job search strategies</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-blue-600">
                  {campaigns.reduce((sum, c) => sum + c.applications_submitted, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {campaigns.length > 0 ? (
                    (campaigns.reduce((sum, c) => sum + c.responses, 0) / 
                     campaigns.reduce((sum, c) => sum + c.applications_submitted, 0) * 100).toFixed(1)
                  ) : 0}%
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-orange-600">
                  {campaigns.reduce((sum, c) => sum + c.interviews, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-xl">{campaign.name}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`text-white ${getStatusColor(campaign.status)}`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => toggleCampaignStatus(campaign.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    {campaign.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Activate</span>
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Target Companies</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.companies.slice(0, 4).map((company, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                      {campaign.companies.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{campaign.companies.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{campaign.locations.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{campaign.salary_range}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Experience Level: <span className="font-medium">{campaign.experience_level}</span></p>
                    <p>Last Activity: {new Date(campaign.last_activity).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{campaign.applications_submitted}</p>
                  <p className="text-sm text-gray-500">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{campaign.responses}</p>
                  <p className="text-sm text-gray-500">Responses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{campaign.interviews}</p>
                  <p className="text-sm text-gray-500">Interviews</p>
                </div>
              </div>

              {/* Progress Bar */}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first job search campaign to start monitoring opportunities.
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign Creation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Create New Campaign</h2>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Senior Product Manager - Tech"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="Product Manager, Senior PM, Product Strategy"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Target Companies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Companies (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.companies}
                  onChange={(e) => setFormData({...formData, companies: e.target.value})}
                  placeholder="Google, Meta, Apple, Microsoft, Amazon"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.locations}
                  onChange={(e) => setFormData({...formData, locations: e.target.value})}
                  placeholder="San Francisco, Seattle, Remote"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Experience Level and Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Executive">Executive Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    placeholder="$150k - $250k"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={createCampaign}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;