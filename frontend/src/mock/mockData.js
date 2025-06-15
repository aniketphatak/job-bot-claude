// Mock data for the Job Application Agent

export const mockUser = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 123-4567',
  linkedinProfile: 'https://linkedin.com/in/alexjohnson',
  resumeUrl: '/mock-resume.pdf',
  createdAt: '2025-01-15T10:00:00Z'
};

export const mockJobSearchCampaigns = [
  {
    id: '1',
    name: 'Senior Product Manager - Tech',
    status: 'active',
    keywords: ['Product Manager', 'Senior PM', 'Product Strategy'],
    companies: ['Google', 'Meta', 'Apple', 'Microsoft', 'Amazon'],
    locations: ['San Francisco', 'Seattle', 'Remote'],
    experienceLevel: 'Senior',
    salaryRange: '$150k - $250k',
    applicationsSubmitted: 23,
    responses: 4,
    interviews: 2,
    createdAt: '2025-01-10T09:00:00Z',
    lastActivity: '2025-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'VP Product - Fintech',
    status: 'paused',
    keywords: ['VP Product', 'Head of Product', 'Product Director'],
    companies: ['Stripe', 'Square', 'Coinbase', 'Robinhood'],
    locations: ['New York', 'San Francisco', 'Remote'],
    experienceLevel: 'Executive',
    salaryRange: '$200k - $350k',
    applicationsSubmitted: 8,
    responses: 2,
    interviews: 1,
    createdAt: '2025-01-05T08:00:00Z',
    lastActivity: '2025-01-12T16:45:00Z'
  }
];

export const mockJobs = [
  {
    id: '1',
    title: 'Senior Product Manager',
    company: 'Meta',
    location: 'San Francisco, CA',
    salary: '$180k - $220k',
    postedAt: '2025-01-15T13:45:00Z',
    applicationDeadline: '2025-01-15T16:45:00Z',
    status: 'monitoring',
    matchScore: 92,
    urgency: 'high',
    description: 'Lead product strategy for our core social platform...',
    requirements: ['5+ years PM experience', 'B2C product experience', 'Data-driven approach'],
    campaignId: '1'
  },
  {
    id: '2',
    title: 'Product Manager - Growth',
    company: 'Stripe',
    location: 'Remote',
    salary: '$160k - $200k',
    postedAt: '2025-01-15T12:30:00Z',
    applicationDeadline: '2025-01-15T15:30:00Z',
    status: 'applied',
    matchScore: 88,
    urgency: 'medium',
    description: 'Drive growth initiatives across our payment platform...',
    requirements: ['3+ years PM experience', 'Growth/experimentation background', 'Technical aptitude'],
    campaignId: '1'
  },
  {
    id: '3',
    title: 'VP of Product',
    company: 'Robinhood',
    location: 'New York, NY',
    salary: '$250k - $300k',
    postedAt: '2025-01-15T11:15:00Z',
    applicationDeadline: '2025-01-15T14:15:00Z',
    status: 'customizing',
    matchScore: 95,
    urgency: 'critical',
    description: 'Lead product organization for our trading platform...',
    requirements: ['8+ years product leadership', 'Fintech experience', 'Team management'],
    campaignId: '2'
  }
];

export const mockApplications = [
  {
    id: '1',
    jobId: '2',
    campaignId: '1',
    submittedAt: '2025-01-15T12:45:00Z',
    status: 'submitted',
    customResume: '/customized-resume-stripe.pdf',
    coverLetter: 'Dear Hiring Manager, I am excited to apply for the Product Manager - Growth position...',
    linkedinMessage: 'Hi, I just applied for the Growth PM role and would love to connect...',
    aiConfidence: 0.91
  },
  {
    id: '2',
    jobId: '1',
    campaignId: '1',
    submittedAt: '2025-01-14T15:20:00Z',
    status: 'response_received',
    customResume: '/customized-resume-meta.pdf',
    coverLetter: 'Dear Meta Team, I am thrilled to apply for the Senior Product Manager position...',
    linkedinMessage: 'Hi, I applied for the Senior PM role and would appreciate connecting...',
    aiConfidence: 0.87,
    response: {
      type: 'interview_request',
      receivedAt: '2025-01-15T10:30:00Z',
      message: 'Thank you for your application. We would like to schedule an initial interview...'
    }
  }
];

export const mockStats = {
  totalApplications: 31,
  responseRate: 12.9,
  interviewRate: 6.5,
  avgResponseTime: 3.2,
  topPerformingKeywords: ['Product Manager', 'Growth', 'B2C'],
  applicationsByDay: [
    { date: '2025-01-10', count: 5 },
    { date: '2025-01-11', count: 3 },
    { date: '2025-01-12', count: 7 },
    { date: '2025-01-13', count: 4 },
    { date: '2025-01-14', count: 6 },
    { date: '2025-01-15', count: 6 }
  ]
};

export const mockProfile = {
  personalInfo: {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    linkedinUrl: 'https://linkedin.com/in/alexjohnson',
    portfolioUrl: 'https://alexjohnson.dev',
    location: 'San Francisco, CA'
  },
  experience: [
    {
      title: 'Senior Product Manager',
      company: 'TechCorp',
      startDate: '2022-03',
      endDate: 'present',
      description: 'Led product strategy for core platform serving 10M+ users...'
    },
    {
      title: 'Product Manager',
      company: 'StartupXYZ',
      startDate: '2020-01',
      endDate: '2022-02',
      description: 'Launched three major features resulting in 40% user growth...'
    }
  ],
  education: [
    {
      degree: 'MBA',
      school: 'Stanford Graduate School of Business',
      graduationYear: '2020'
    },
    {
      degree: 'BS Computer Science',
      school: 'UC Berkeley',
      graduationYear: '2016'
    }
  ],
  skills: ['Product Strategy', 'Data Analysis', 'User Research', 'A/B Testing', 'SQL', 'Python'],
  certifications: ['Google Analytics', 'Scrum Master'],
  preferences: {
    minSalary: 150000,
    maxSalary: 250000,
    workArrangement: 'hybrid',
    willingnessToRelocate: false
  }
};