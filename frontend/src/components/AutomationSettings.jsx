import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Settings,
  Zap,
  Shield,
  Clock,
  Target,
  Ban,
  Check,
  AlertTriangle,
  Play,
  BarChart3
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export default function AutomationSettings({ userId }) {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    enabled: false,
    auto_apply_enabled: false,
    daily_application_limit: 10,
    min_match_score: 0.75,
    urgency_levels: ['critical', 'high'],
    approval_mode: 'review_before_apply',
    excluded_companies: [],
    required_keywords: [],
    excluded_keywords: [],
    auto_generate_content: true,
    notification_email: ''
  });

  const [companyInput, setCompanyInput] = useState('');
  const [requiredKeywordInput, setRequiredKeywordInput] = useState('');
  const [excludedKeywordInput, setExcludedKeywordInput] = useState('');

  useEffect(() => {
    if (userId) {
      loadSettings();
      loadStats();
    }
  }, [userId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/automation-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          enabled: data.enabled || false,
          auto_apply_enabled: data.auto_apply_enabled || false,
          daily_application_limit: data.daily_application_limit || 10,
          min_match_score: data.min_match_score || 0.75,
          urgency_levels: data.urgency_levels || ['critical', 'high'],
          approval_mode: data.approval_mode || 'review_before_apply',
          excluded_companies: data.excluded_companies || [],
          required_keywords: data.required_keywords || [],
          excluded_keywords: data.excluded_keywords || [],
          auto_generate_content: data.auto_generate_content !== false,
          notification_email: data.notification_email || ''
        });
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/auto-apply/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading auto-apply stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/automation-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Automation settings saved successfully'
        });
        loadSettings();
        loadStats();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save automation settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerNow = async () => {
    setTriggering(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/auto-apply/trigger`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Auto-apply triggered! ${data.applications_submitted} applications submitted.`
        });
        loadStats();
      } else {
        throw new Error('Failed to trigger auto-apply');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger auto-apply',
        variant: 'destructive'
      });
    } finally {
      setTriggering(false);
    }
  };

  const addExcludedCompany = () => {
    if (companyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        excluded_companies: [...prev.excluded_companies, companyInput.trim()]
      }));
      setCompanyInput('');
    }
  };

  const removeExcludedCompany = (company) => {
    setFormData(prev => ({
      ...prev,
      excluded_companies: prev.excluded_companies.filter(c => c !== company)
    }));
  };

  const addRequiredKeyword = () => {
    if (requiredKeywordInput.trim()) {
      setFormData(prev => ({
        ...prev,
        required_keywords: [...prev.required_keywords, requiredKeywordInput.trim()]
      }));
      setRequiredKeywordInput('');
    }
  };

  const removeRequiredKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      required_keywords: prev.required_keywords.filter(k => k !== keyword)
    }));
  };

  const addExcludedKeyword = () => {
    if (excludedKeywordInput.trim()) {
      setFormData(prev => ({
        ...prev,
        excluded_keywords: [...prev.excluded_keywords, excludedKeywordInput.trim()]
      }));
      setExcludedKeywordInput('');
    }
  };

  const removeExcludedKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      excluded_keywords: prev.excluded_keywords.filter(k => k !== keyword)
    }));
  };

  const toggleUrgencyLevel = (level) => {
    setFormData(prev => {
      const levels = prev.urgency_levels.includes(level)
        ? prev.urgency_levels.filter(l => l !== level)
        : [...prev.urgency_levels, level];
      return { ...prev, urgency_levels: levels };
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading automation settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Auto-Apply Statistics
            </CardTitle>
            <CardDescription>
              Track your automated job application performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total_auto_applied}</div>
                <div className="text-sm text-gray-600">Total Auto-Applied</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.applications_today}/{stats.daily_limit}</div>
                <div className="text-sm text-gray-600">Today's Applications</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.responses_received}</div>
                <div className="text-sm text-gray-600">Responses Received</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(stats.response_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Response Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure automatic job search and application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <Label className="text-base font-semibold">Enable Automation</Label>
                <p className="text-sm text-gray-600">Master switch for all automation features</p>
              </div>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {formData.enabled && (
            <>
              <Separator />

              {/* Auto-Apply Switch */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-green-500" />
                  <div>
                    <Label className="text-base font-semibold">Auto-Apply to Jobs</Label>
                    <p className="text-sm text-gray-600">Automatically apply to jobs matching your criteria</p>
                  </div>
                </div>
                <Switch
                  checked={formData.auto_apply_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_apply_enabled: checked }))}
                />
              </div>

              {/* Approval Mode */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Approval Mode
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-3 border rounded-lg text-left ${
                      formData.approval_mode === 'auto' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, approval_mode: 'auto' }))}
                  >
                    <div className="font-semibold">Fully Automatic</div>
                    <div className="text-sm text-gray-600">Apply without review</div>
                  </button>
                  <button
                    type="button"
                    className={`p-3 border rounded-lg text-left ${
                      formData.approval_mode === 'review_before_apply' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, approval_mode: 'review_before_apply' }))}
                  >
                    <div className="font-semibold">Review Before Apply</div>
                    <div className="text-sm text-gray-600">Notify me to approve</div>
                  </button>
                </div>
              </div>

              {/* Daily Limit */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Daily Application Limit
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.daily_application_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, daily_application_limit: parseInt(e.target.value) }))}
                />
                <p className="text-sm text-gray-600">
                  Maximum applications to submit per day (recommended: 5-15)
                </p>
              </div>

              {/* Match Score Threshold */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Minimum Match Score: {(formData.min_match_score * 100).toFixed(0)}%
                </Label>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={formData.min_match_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_match_score: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">
                  Only apply to jobs with match score above this threshold
                </p>
              </div>

              {/* Urgency Levels */}
              <div className="space-y-2">
                <Label>Urgency Levels to Auto-Apply</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['critical', 'high', 'medium', 'low'].map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`p-2 border rounded-lg capitalize ${
                        formData.urgency_levels.includes(level) ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => toggleUrgencyLevel(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excluded Companies */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  Excluded Companies
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add company to exclude (e.g., Amazon)"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedCompany())}
                  />
                  <Button type="button" onClick={addExcludedCompany} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.excluded_companies.map(company => (
                    <Badge key={company} variant="secondary" className="flex items-center gap-1">
                      {company}
                      <button
                        type="button"
                        onClick={() => removeExcludedCompany(company)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Required Keywords */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Required Keywords
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add required keyword"
                    value={requiredKeywordInput}
                    onChange={(e) => setRequiredKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredKeyword())}
                  />
                  <Button type="button" onClick={addRequiredKeyword} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.required_keywords.map(keyword => (
                    <Badge key={keyword} variant="default" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeRequiredKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Excluded Keywords */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Excluded Keywords
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword to exclude"
                    value={excludedKeywordInput}
                    onChange={(e) => setExcludedKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedKeyword())}
                  />
                  <Button type="button" onClick={addExcludedKeyword} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.excluded_keywords.map(keyword => (
                    <Badge key={keyword} variant="destructive" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeExcludedKeyword(keyword)}
                        className="ml-1 hover:text-red-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Auto-Generate Content */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-semibold">Auto-Generate Content</Label>
                  <p className="text-sm text-gray-600">Generate cover letters and resume summaries automatically</p>
                </div>
                <Switch
                  checked={formData.auto_generate_content}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_generate_content: checked }))}
                />
              </div>

              {/* Notification Email */}
              <div className="space-y-2">
                <Label>Notification Email (Optional)</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.notification_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, notification_email: e.target.value }))}
                />
                <p className="text-sm text-gray-600">
                  Receive email notifications when applications are submitted
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            {formData.enabled && formData.auto_apply_enabled && (
              <Button
                onClick={handleTriggerNow}
                disabled={triggering}
                variant="outline"
                className="flex-1"
              >
                {triggering ? 'Running...' : 'Run Auto-Apply Now'}
              </Button>
            )}
          </div>

          {/* Warning Alert */}
          {formData.enabled && formData.auto_apply_enabled && formData.approval_mode === 'auto' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Fully automatic mode will apply to jobs without your review.
                Make sure your criteria are properly configured to avoid unwanted applications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
