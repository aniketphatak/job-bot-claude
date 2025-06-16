import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Save, 
  Plus, 
  X, 
  Upload,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
  FileText,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    personal_info: {
      full_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      portfolio_url: '',
      location: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    preferences: {
      min_salary: '',
      max_salary: '',
      work_arrangement: 'hybrid',
      willingness_to_relocate: false
    }
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Use authenticated user ID
  const userId = user?.id;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      setProfile(response.data);
      setFormData({
        personal_info: response.data.personal_info || {
          full_name: '',
          email: '',
          phone: '',
          linkedin_url: '',
          portfolio_url: '',
          location: ''
        },
        experience: response.data.experience || [],
        education: response.data.education || [],
        skills: response.data.skills || [],
        certifications: response.data.certifications || [],
        preferences: response.data.preferences || {
          min_salary: '',
          max_salary: '',
          work_arrangement: 'hybrid',
          willingness_to_relocate: false
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If no profile exists, show create form
      setProfile(null);
      setEditing(true);
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Update existing profile
      await axios.put(`${API}/users/${userId}`, formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(`${API}/users/${userId}/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully.",
      });

      fetchProfile();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingResume(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteResume = async () => {
    try {
      await axios.delete(`${API}/users/${userId}/resume`);
      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted successfully.",
      });
      fetchProfile();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, {
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    });
  };

  const removeExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData({...formData, experience: updated});
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
        degree: '',
        school: '',
        graduation_year: ''
      }]
    });
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({...formData, education: updated});
  };

  const addSkill = (skillText) => {
    if (skillText.trim() && !formData.skills.includes(skillText.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillText.trim()]
      });
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile && !editing) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profile Found</h3>
            <p className="text-gray-600 mb-6">
              Create your profile to start using JobBot's automated job application features.
            </p>
            <Button 
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional profile for job applications</p>
        </div>
        {!editing ? (
          <Button 
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditing(false);
                fetchProfile();
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.personal_info.full_name}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: {...formData.personal_info, full_name: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.personal_info?.full_name || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.personal_info.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: {...formData.personal_info, email: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.personal_info?.email || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.personal_info.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: {...formData.personal_info, phone: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.personal_info?.phone || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.personal_info.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: {...formData.personal_info, location: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.personal_info?.location || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              {editing ? (
                <input
                  type="url"
                  value={formData.personal_info.linkedin_url}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: {...formData.personal_info, linkedin_url: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.personal_info?.linkedin_url || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
              {editing ? (
                <input
                  type="url"
                  value={formData.personal_info.portfolio_url}
                  onChange={(e) => setFormData({
                    ...formData,
                    personal_info: {...formData.personal_info, portfolio_url: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.personal_info?.portfolio_url || 'Not specified'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Experience</span>
            </CardTitle>
            {editing && (
              <Button onClick={addExperience} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            formData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  <Button 
                    onClick={() => removeExperience(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      placeholder="YYYY-MM"
                      value={exp.start_date}
                      onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="text"
                      placeholder="YYYY-MM or 'present'"
                      value={exp.end_date}
                      onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))
          ) : (
            profile?.experience?.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                <p className="text-gray-700">{exp.company}</p>
                <p className="text-sm text-gray-500">{exp.start_date} - {exp.end_date}</p>
                <p className="text-gray-600 mt-2">{exp.description}</p>
              </div>
            )) || <p className="text-gray-500">No experience added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Resume</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.resume_file ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{profile.resume_file.filename}</p>
                  <p className="text-sm text-green-600">
                    Uploaded {new Date(profile.resume_file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Replace
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteResume}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 mb-4">
                Upload your resume to help JobBot generate tailored applications and cover letters.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {uploadingResume ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supports PDF, DOC, and DOCX files up to 5MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Skills</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="flex items-center space-x-1"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              )) || <p className="text-gray-500">No skills added yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;