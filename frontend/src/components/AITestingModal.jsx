import React, { useState } from 'react';
import { 
  Bot, 
  FileText, 
  User, 
  MessageSquare,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const AITestingModal = ({ isOpen, onClose, job, userProfile }) => {
  const [activeTest, setActiveTest] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const { toast } = useToast();

  // Aniket's user ID from the test
  const userId = '7db1f025-21f6-4737-a7a0-0c92c0581d71';

  const testTypes = [
    {
      id: 'cover_letter',
      title: 'Cover Letter',
      description: 'Generate AI-powered cover letter',
      icon: FileText,
      endpoint: 'generate-cover-letter'
    },
    {
      id: 'resume_summary',
      title: 'Resume Summary',
      description: 'Customize resume summary for this job',
      icon: User,
      endpoint: 'generate-resume-summary'
    },
    {
      id: 'linkedin_message',
      title: 'LinkedIn Message',
      description: 'Create networking message',
      icon: MessageSquare,
      endpoint: 'generate-linkedin-message'
    }
  ];

  const runAITest = async (testType, provider = 'openai', model = 'gpt-4o') => {
    setLoading({ ...loading, [testType.id]: true });
    
    try {
      const requestData = {
        job_id: job.id,
        provider: provider,
        model: model
      };

      const response = await axios.post(
        `${API}/users/${userId}/ai/${testType.endpoint}`,
        requestData
      );

      if (response.data.success) {
        setResults({
          ...results,
          [testType.id]: {
            success: true,
            content: response.data[testType.id] || response.data.cover_letter || response.data.resume_summary || response.data.linkedin_message,
            provider: response.data.provider,
            model: response.data.model,
            generated_at: response.data.generated_at
          }
        });

        toast({
          title: "AI Test Successful",
          description: `${testType.title} generated successfully!`,
        });
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (error) {
      setResults({
        ...results,
        [testType.id]: {
          success: false,
          error: error.response?.data?.detail || error.message
        }
      });

      toast({
        title: "AI Test Failed",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, [testType.id]: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold">AI Testing Lab</h2>
              <p className="text-sm text-gray-600">Test AI integrations for: {job?.title} at {job?.company}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Position:</span> {job?.title}
                </div>
                <div>
                  <span className="font-medium">Company:</span> {job?.company}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {job?.location}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testTypes.map((testType) => {
              const Icon = testType.icon;
              const result = results[testType.id];
              const isLoading = loading[testType.id];

              return (
                <Card key={testType.id} className="border-2 hover:border-purple-200 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg">{testType.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">{testType.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Test Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => runAITest(testType, 'openai', 'gpt-4o')}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Bot className="w-4 h-4 mr-2" />
                        )}
                        Test OpenAI
                      </Button>
                      
                      <Button
                        onClick={() => runAITest(testType, 'anthropic', 'claude-sonnet-4-20250514')}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Bot className="w-4 h-4 mr-2" />
                        )}
                        Test Claude
                      </Button>
                    </div>

                    {/* Results */}
                    {result && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                          {result.success && (
                            <Badge variant="secondary" className="text-xs">
                              {result.provider}
                            </Badge>
                          )}
                        </div>
                        
                        {result.success ? (
                          <div className="bg-gray-50 rounded p-2 text-xs max-h-32 overflow-y-auto">
                            {result.content.substring(0, 200)}...
                          </div>
                        ) : (
                          <div className="bg-red-50 rounded p-2 text-xs text-red-700">
                            {result.error}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <h4 className="font-medium mb-1">How to use the AI Testing Lab:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Click test buttons to generate AI content for this specific job</li>
                    <li>Compare results between OpenAI and Anthropic models</li>
                    <li>Generated content will be saved and can be used for actual applications</li>
                    <li>Make sure you have valid API keys configured in Settings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AITestingModal;