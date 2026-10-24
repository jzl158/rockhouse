"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  Phone,
  Camera,
  Download,
  MessageSquare,
  Star,
  AlertCircle,
  DollarSign,
  Settings,
  ChevronRight,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

type CustomerQuote = {
  id: string;
  reference_number: string;
  service_type: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  valid_until: string;
  notes?: string;
  quote_items?: any[];
};

type Project = {
  id: string;
  reference_number: string;
  service_type: string;
  status: string;
  customer_name: string;
  customer_address: string | null;
  preferred_date: string | null;
  assignment_date: string | null;
  service_details: string | null;
  assigned_employee_id: string | null;
  created_at: string;
  estimated_completion?: string;
  progress_percentage?: number;
};

type Communication = {
  id: string;
  message: string;
  created_at: string;
  from_admin: boolean;
  read: boolean;
};

export default function CustomerDashboard() {
  const { profile, signOut } = useAuth();
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'projects' | 'messages'>('overview');

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!profile?.email) return;

      try {
        // Fetch quotes
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('customer_email', profile.email)
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;
        setQuotes(quotesData || []);

        // Fetch projects (bookings)
        const { data: projectsData, error: projectsError } = await supabase
          .from('booking')
          .select('*')
          .eq('customer_email', profile.email)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
          setProjects([]);
        } else {
          setProjects(projectsData || []);
        }

      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoadingQuotes(false);
        setLoadingProjects(false);
      }
    };

    fetchCustomerData();
  }, [profile?.email]);

  const handleQuoteAction = async (quoteId: string, action: 'approve' | 'reject', feedback?: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          customer_feedback: feedback || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;
      
      // Refresh quotes
      const { data } = await supabase
        .from('quotes')
        .select('*')
        .eq('customer_email', profile?.email)
        .order('created_at', { ascending: false });
      
      setQuotes(data || []);
      alert(action === 'approve' ? 'Quote approved successfully!' : 'Quote declined.');
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote. Please try again.');
    }
  };

  const getProjectProgress = (project: Project) => {
    switch (project.status) {
      case 'Pending': return 0;
      case 'Confirmed': return 25;
      case 'Assigned': return 50;
      case 'In Progress': return 75;
      case 'Completed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'Completed': case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': case 'In Progress': case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'pending': case 'Pending': case 'Confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['customer', 'Customer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-[#255756]">Customer Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {profile?.firstName} {profile?.lastName}!
                </p>
              </div>
              <button 
                onClick={async () => { await signOut(); window.location.assign("/"); }}
                className="px-4 py-2 text-sm border border-[#255756] text-[#255756] hover:bg-[#255756] hover:text-white rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
            
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[{ key: 'overview', label: 'Overview', icon: Settings },
                  { key: 'quotes', label: 'Quotes', icon: FileText },
                  { key: 'projects', label: 'Projects', icon: Calendar },
                  { key: 'messages', label: 'Messages', icon: MessageSquare }].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === key
                        ? 'border-[#255756] text-[#255756]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                      <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{projects.filter(p => !['Completed', 'Cancelled'].includes(p.status)).length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                      <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.status === 'pending').length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Completed').length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-[#255756] mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <a href="/contact?type=quote" className="w-full text-left p-4 rounded border hover:bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span>Request New Quote</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </a>
                  <a href="/contact" className="w-full text-left p-4 rounded border hover:bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span>Schedule Service</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </a>
                  <a href="/portfolio" className="w-full text-left p-4 rounded border hover:bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-gray-400 mr-3" />
                      <span>View Portfolio</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </a>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#255756]">Recent Projects</h2>
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className="text-sm text-[#255756] hover:underline"
                  >
                    View All
                  </button>
                </div>
                {loadingProjects ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#255756] mx-auto"></div>
                  </div>
                ) : projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{project.service_type}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-[#255756] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProjectProgress(project)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {project.preferred_date ? format(new Date(project.preferred_date), 'MMM d, yyyy') : 'Date TBD'}
                    </p>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No projects yet</p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-[#255756] mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {quotes.slice(0, 3).map((quote) => (
                    <div key={quote.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">Quote {quote.reference_number}</p>
                        <p className="text-xs text-gray-500">{format(new Date(quote.created_at), 'MMM d, h:mm a')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                  ))}
                  {projects.slice(0, 2).map((project) => (
                    <div key={project.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">Project {project.reference_number}</p>
                        <p className="text-xs text-gray-500">Status updated</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                  {quotes.length === 0 && projects.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-[#255756]">My Quotes</h2>
                </div>
                <div className="p-6">
                  {loadingQuotes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#255756] mx-auto"></div>
                    </div>
                  ) : quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <div key={quote.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{quote.reference_number}</h3>
                              <p className="text-gray-600">{quote.service_type}</p>
                              <p className="text-sm text-gray-500 mt-1">Created {format(new Date(quote.created_at), 'MMM d, yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                                {quote.status}
                              </span>
                              {quote.total_amount && (
                                <p className="text-lg font-bold text-gray-900 mt-2">
                                  ${quote.total_amount.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {quote.notes && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                              <p className="text-sm text-gray-600">{quote.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>Valid until {format(new Date(quote.valid_until), 'MMM d, yyyy')}</span>
                            </div>
                            
                            {quote.status === 'pending' && (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => {
                                    const feedback = prompt('Any additional comments or requests?');
                                    handleQuoteAction(quote.id, 'approve', feedback || undefined);
                                  }}
                                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const feedback = prompt('Please let us know why you\'re declining this quote:');
                                    if (feedback) {
                                      handleQuoteAction(quote.id, 'reject', feedback);
                                    }
                                  }}
                                  className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                                >
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                  Decline
                                </button>
                              </div>
                            )}
                            
                            <div className="flex space-x-2">
                              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </button>
                              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No quotes yet</p>
                      <p className="text-gray-400 mb-6">Request your first quote to get started</p>
                      <a href="/contact?type=quote" className="inline-flex items-center px-4 py-2 bg-[#255756] text-white rounded-md hover:bg-[#1e4544] transition-colors">
                        <FileText className="h-4 w-4 mr-2" />
                        Request Quote
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-[#255756]">My Projects</h2>
                </div>
                <div className="p-6">
                  {loadingProjects ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#255756] mx-auto"></div>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="space-y-6">
                      {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{project.service_type}</h3>
                              <p className="text-gray-600 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {project.customer_address || 'Address not specified'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">Project #{project.reference_number}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-600">{getProjectProgress(project)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-[#255756] h-3 rounded-full transition-all duration-500"
                                style={{ width: `${getProjectProgress(project)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {project.service_details && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">Project Details:</p>
                              <p className="text-sm text-gray-600">{project.service_details}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Scheduled Date</p>
                              <p className="text-gray-600 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {project.preferred_date ? format(new Date(project.preferred_date), 'MMM d, yyyy') : 'TBD'}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Assignment Date</p>
                              <p className="text-gray-600">
                                {project.assignment_date ? format(new Date(project.assignment_date), 'MMM d, yyyy') : 'Not assigned'}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Created</p>
                              <p className="text-gray-600">{format(new Date(project.created_at), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {project.assigned_employee_id && (
                                <span className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  Assigned to team
                                </span>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                <Camera className="h-4 w-4 mr-1" />
                                Photos
                              </button>
                              <button className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No projects yet</p>
                      <p className="text-gray-400 mb-6">Your approved quotes will become projects</p>
                      <a href="/contact?type=quote" className="inline-flex items-center px-4 py-2 bg-[#255756] text-white rounded-md hover:bg-[#1e4544] transition-colors">
                        <FileText className="h-4 w-4 mr-2" />
                        Request Quote
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-[#255756]">Messages</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Messaging System</p>
                    <p className="text-gray-400 mb-6">Direct communication with our team is coming soon!</p>
                    <p className="text-sm text-gray-500">
                      For now, please call us at <a href="tel:(470)707-7689" className="text-[#255756] hover:underline">(470) 707-7689</a><br/>
                      or email <a href="mailto:sauvageoutdoors@gmail.com" className="text-[#255756] hover:underline">sauvageoutdoors@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}