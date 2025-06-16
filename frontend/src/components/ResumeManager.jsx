import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  Target,
  Star,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const ResumeManager = ({ onProfileUpdate }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API}/users/${user.id}/resumes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token found');
      console.log('User ID:', user.id);
      console.log('API URL:', `${API}/users/${user.id}/resume`);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type header for FormData - let browser set it
      const response = await axios.post(`${API}/users/${user.id}/resume`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      toast({
        title: "Resume Uploaded Successfully! 🎉",
        description: `Your resume has been uploaded and parsed. Profile information updated automatically.`,
      });

      // Refresh resumes and user profile
      await fetchResumes();
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.detail || error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API}/users/${user.id}/resume/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast({
        title: "Resume Deleted",
        description: "Resume has been deleted successfully.",
      });
      fetchResumes();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  // Get the most recent resume (active one)
  const activeResume = resumes.find(resume => resume.is_active) || resumes[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Resume Management</span>
            {activeResume && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Uploaded
              </Badge>
            )}
          </CardTitle>
          {!activeResume && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Resume
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Banner */}
        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Smart Resume Management</h4>
            <p className="text-sm text-green-700 mt-1">
              Upload your resume and JobBot will automatically extract your personal information, experience, and skills 
              to populate your profile. JobBot will then create tailored resumes and cover letters for each job application.
            </p>
          </div>
        </div>

        {/* Current Resume or Upload Prompt */}
        {activeResume ? (
          <div className="flex items-center justify-between p-4 border border-green-300 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {getFileIcon(activeResume.filename)}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900">{activeResume.filename}</h5>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Star className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{formatFileSize(activeResume.size)}</span>
                  <span>•</span>
                  <span>Uploaded {new Date(activeResume.uploaded_at).toLocaleDateString()}</span>
                  {activeResume.parsed_data && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Profile Updated
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-1" />
                Replace
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteResume(activeResume.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Uploaded</h3>
            <p className="text-gray-600 mb-4">
              Upload your resume to automatically populate your profile information and get started with job applications.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Uploading & Parsing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF, DOC, and DOCX files up to 5MB
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default ResumeManager;