'use client';

import { useState, useEffect } from 'react';
import { 
  DashboardMetrics,
  RecentActivity,
  UpcomingTask
} from './dashboardHelpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Eye,
  Settings,
  Filter,
  Search,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [tasks, setTasks] = useState<UpcomingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'communications' | 'workflow'>('overview');

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return; // Don't load if no user authenticated
      
      try {
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const { metrics: metricsData, activities: activitiesData, tasks: tasksData, error } = await response.json();
        
        if (error) {
          throw new Error(error);
        }

        setMetrics(metricsData);
        setActivities(activitiesData);
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [user, profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Overview
          </button>
          <button
            onClick={() => setCurrentView('communications')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'communications'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2 inline" />
            Communications
          </button>
          <button
            onClick={() => setCurrentView('workflow')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'workflow'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4 mr-2 inline" />
            Workflow
          </button>
        </div>
      </div>

      {currentView === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-semibold">${metrics?.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-green-600">↑ ${metrics?.monthlyStats.revenue.toFixed(2)}</span> this month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <h3 className="text-2xl font-semibold">{metrics?.activeProjects}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-blue-600">{metrics?.monthlyStats.completedProjects}</span> completed this month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <h3 className="text-2xl font-semibold">{metrics?.totalBookings}</h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-purple-600">+{metrics?.monthlyStats.bookings}</span> new this month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
              <h3 className="text-2xl font-semibold">{metrics?.pendingQuotes}</h3>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Requires attention
          </div>
        </Card>
      </div>

      {/* Weekly Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Bookings</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-xl font-medium">{metrics?.weeklyStats.bookings}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Revenue</p>
            <div className="flex items-center mt-1">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-xl font-medium">${metrics?.weeklyStats.revenue.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed Projects</p>
            <div className="flex items-center mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-xl font-medium">{metrics?.weeklyStats.completedProjects}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                <div className={`mt-1 rounded-full p-2 ${
                  activity.type === 'booking' ? 'bg-blue-100' :
                  activity.type === 'quote' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  {activity.type === 'booking' ? <Users className="h-4 w-4 text-blue-600" /> :
                   activity.type === 'quote' ? <FileText className="h-4 w-4 text-yellow-600" /> :
                   <DollarSign className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.title}</p>
                    <Badge variant={
                      activity.status === 'completed' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                <div className={`mt-1 rounded-full p-2 ${
                  task.priority === 'high' ? 'bg-red-100' :
                  task.priority === 'medium' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  <Clock className={`h-4 w-4 ${
                    task.priority === 'high' ? 'text-red-600' :
                    task.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'secondary' :
                      'default'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{task.type}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </p>
                    {task.assignedTo && (
                      <p className="text-xs text-gray-600">
                        Assigned to: {task.assignedTo.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
          </div>
        </>
      )}

      {currentView === 'communications' && (
        <div className="space-y-6">
          {/* Communication Center */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <MessageSquare className="mr-2" />
              Communication Center
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Message Templates */}
              <div>
                <h3 className="text-lg font-medium mb-4">Quick Message Templates</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project Update</p>
                      <p className="text-sm text-gray-600">Send status update to customer</p>
                    </div>
                    <Send className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Quote Follow-up</p>
                      <p className="text-sm text-gray-600">Follow up on pending quotes</p>
                    </div>
                    <Send className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Schedule Reminder</p>
                      <p className="text-sm text-gray-600">Remind about upcoming appointments</p>
                    </div>
                    <Send className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Recent Messages */}
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Communications</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">John Smith</span>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Requested quote follow-up for deck installation project</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <Mail className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Sarah Johnson</span>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Project completion confirmation and satisfaction survey</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Contact Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Customer Contact Management</h2>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Last Contact</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">Mike Davis</p>
                        <p className="text-sm text-gray-600">mike@example.com</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">3 days ago</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">Active Project</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Phone size={16} />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                          <Mail size={16} />
                        </button>
                        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {currentView === 'workflow' && (
        <div className="space-y-6">
          {/* Workflow Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Settings className="mr-2" />
              Workflow Management
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Approvals */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <UserCheck className="mr-2" size={20} />
                  Pending Approvals
                </h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                    <p className="font-medium">Quote #Q-2024-156</p>
                    <p className="text-sm text-gray-600">Deck Installation - $4,500</p>
                    <p className="text-xs text-gray-500 mt-1">Submitted 2 days ago</p>
                    <div className="flex space-x-2 mt-3">
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
                    <p className="font-medium">Employee Request</p>
                    <p className="text-sm text-gray-600">Time off - March 15-17</p>
                    <p className="text-xs text-gray-500 mt-1">From: John Employee</p>
                    <div className="flex space-x-2 mt-3">
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Assignment */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <ClipboardList className="mr-2" size={20} />
                  Task Assignment
                </h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <select className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-500">
                      <option>Select Employee</option>
                      <option>John Smith</option>
                      <option>Mike Johnson</option>
                      <option>Sarah Davis</option>
                    </select>
                    <select className="w-full mb-3 p-2 border rounded focus:ring-2 focus:ring-blue-500">
                      <option>Select Task Type</option>
                      <option>Site Visit</option>
                      <option>Quote Preparation</option>
                      <option>Project Start</option>
                      <option>Follow-up Call</option>
                    </select>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Assign Task
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Quote Response Time</span>
                      <span className="text-sm text-green-600">↓ 2.1 hrs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Project Completion</span>
                      <span className="text-sm text-blue-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm text-green-600">4.8/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Team Schedule Overview */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Team Schedule Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="border rounded-lg p-4">
                  <h4 className="font-medium text-center mb-3">{day}</h4>
                  <div className="space-y-2">
                    {index < 5 && (
                      <>
                        <div className="p-2 bg-blue-100 rounded text-xs">
                          <p className="font-medium">John S.</p>
                          <p>Deck Project</p>
                          <p className="text-gray-600">9:00 AM</p>
                        </div>
                        {index < 3 && (
                          <div className="p-2 bg-green-100 rounded text-xs">
                            <p className="font-medium">Mike J.</p>
                            <p>Landscaping</p>
                            <p className="text-gray-600">2:00 PM</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}