import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bot, 
  Key,
  LinkedinIcon,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const SettingsPage = () => {
  const [aiModels, setAiModels] = useState({});
  const [aiPreferences, setAiPreferences] = useState({
    provider: 'openai',
    model: 'gpt-4o'
  });
  const [linkedinAuthUrl, setLinkedinAuthUrl] = useState('');
  const [linkedinRateLimit, setLinkedinRateLimit] = useState({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState({});
  const { toast } = useToast();

  // Aniket's user ID from the test
  const userId = '7db1f025-21f6-4737-a7a0-0c92c0581d71';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch available AI models
      const modelsResponse = await axios.get(`${API}/ai/models`);
      setAiModels(modelsResponse.data);

      // Fetch user AI preferences
      const prefsResponse = await axios.get(`${API}/users/${userId}/ai/preferences`);
      setAiPreferences(prefsResponse.data);

      // Fetch LinkedIn auth URL
      const authResponse = await axios.get(`${API}/linkedin/auth-url`);
      setLinkedinAuthUrl(authResponse.data.auth_url);

      // Fetch LinkedIn rate limit status
      const rateLimitResponse = await axios.get(`${API}/linkedin/rate-limit`);
      setLinkedinRateLimit(rateLimitResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const saveAiPreferences = async () => {
    try {
      await axios.post(`${API}/users/${userId}/ai/preferences`, aiPreferences);
      toast({
        title: "Settings Saved",
        description: "AI preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI preferences.",
        variant: "destructive",
      });
    }
  };

  const testAiIntegration = async (provider, model) => {
    const testKey = `${provider}_${model}`;
    setTesting({ ...testing, [testKey]: true });

    try {
      // Test with a simple job scenario
      const testJobData = {
        job_id: '5103d576-ef61-4055-b56c-836f3ec68a96', // Use existing job from our test data
        provider: provider,
        model: model
      };

      const response = await axios.post(`${API}/users/${userId}/ai/generate-cover-letter`, testJobData);
      
      if (response.data.success) {
        toast({
          title: "Test Successful",
          description: `${provider} ${model} is working correctly.`,
        });
      } else {
        throw new Error(response.data.error || 'Test failed');
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    } finally {
      setTesting({ ...testing, [testKey]: false });
    }
  };

  const handleLinkedinAuth = () => {
    // Open LinkedIn auth in new window
    const authWindow = window.open(
      linkedinAuthUrl,
      'linkedin-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Listen for auth completion (simplified - in production you'd handle the callback properly)
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        toast({
          title: "LinkedIn Authentication",
          description: "Please complete the authentication process.",
        });
      }
    }, 1000);
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your JobBot integrations and preferences</p>
        </div>
      </div>

      {/* AI Integration Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-xl">AI Integration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenAI */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">OpenAI</h3>
                  <p className="text-sm text-gray-600">GPT-4 and other OpenAI models</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Available
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Model
                  </label>
                  <select 
                    value={aiPreferences.provider === 'openai' ? aiPreferences.model : ''}
                    onChange={(e) => setAiPreferences({
                      provider: 'openai',
                      model: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {aiModels.openai?.models.map(model => (
                      <option key={model} value={model}>
                        {model} {model === aiModels.openai.recommended ? '(Recommended)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => testAiIntegration('openai', aiPreferences.model)}
                    disabled={testing[`openai_${aiPreferences.model}`]}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing[`openai_${aiPreferences.model}`] ? 'Testing...' : 'Test'}
                  </Button>
                  
                  <Button
                    onClick={() => setAiPreferences({ provider: 'openai', model: aiModels.openai?.recommended || 'gpt-4o' })}
                    variant={aiPreferences.provider === 'openai' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                  >
                    {aiPreferences.provider === 'openai' ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Anthropic */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Anthropic Claude</h3>
                  <p className="text-sm text-gray-600">Claude Sonnet and other models</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Backup
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Model
                  </label>
                  <select 
                    value={aiPreferences.provider === 'anthropic' ? aiPreferences.model : ''}
                    onChange={(e) => setAiPreferences({
                      provider: 'anthropic',
                      model: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {aiModels.anthropic?.models.map(model => (
                      <option key={model} value={model}>
                        {model} {model === aiModels.anthropic.recommended ? '(Recommended)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => testAiIntegration('anthropic', aiModels.anthropic?.recommended || 'claude-sonnet-4-20250514')}
                    disabled={testing[`anthropic_${aiModels.anthropic?.recommended}`]}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing[`anthropic_${aiModels.anthropic?.recommended}`] ? 'Testing...' : 'Test'}
                  </Button>
                  
                  <Button
                    onClick={() => setAiPreferences({ provider: 'anthropic', model: aiModels.anthropic?.recommended || 'claude-sonnet-4-20250514' })}
                    variant={aiPreferences.provider === 'anthropic' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                  >
                    {aiPreferences.provider === 'anthropic' ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">
                Current: {aiPreferences.provider} - {aiPreferences.model}
              </span>
            </div>
            <Button onClick={saveAiPreferences}>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Integration */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <LinkedinIcon className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-xl">LinkedIn Integration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Authentication */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Authentication</h3>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">OAuth Status</span>
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    Not Connected
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleLinkedinAuth}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <LinkedinIcon className="w-4 h-4 mr-2" />
                  Connect LinkedIn Account
                </Button>
                
                <p className="text-xs text-gray-500">
                  Connect your LinkedIn account to enable job searching and application features.
                </p>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">API Usage</h3>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily API Calls</span>
                  <span className="text-sm">
                    {linkedinRateLimit.calls_made_today || 0} / {linkedinRateLimit.daily_limit || 100}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${((linkedinRateLimit.calls_made_today || 0) / (linkedinRateLimit.daily_limit || 100)) * 100}%` 
                    }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Calls Remaining: {linkedinRateLimit.calls_remaining || 100}</p>
                  <p>Resets: {linkedinRateLimit.resets_at || '00:00 UTC'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Setup Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-800">API Keys Required</h4>
                <p className="text-sm text-yellow-700">
                  To use JobBot's full functionality, you need to provide API keys for AI and LinkedIn services.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-yellow-600" />
                    <span>OpenAI API Key: Get from</span>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-yellow-600" />
                    <span>LinkedIn API: Get from</span>
                    <a href="https://developer.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      LinkedIn Developer <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Mode Notice */}
      <Card className="border-0 shadow-lg bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Bot className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Demo Mode Active</h3>
              <p className="text-blue-800 text-sm mb-3">
                JobBot is currently running in demo mode with mock data. To enable full functionality:
              </p>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                <li>Add your OpenAI API key to enable AI-powered resume and cover letter generation</li>
                <li>Add your LinkedIn API credentials to enable real job searching and applications</li>
                <li>Configure your job search preferences and let JobBot work for you!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;