"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Phone,
  User,
  Wrench,
  MessageSquare,
  Camera,
  Upload,
  FileText,
  Send,
} from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_type: string;
  preferred_date: string | null;
  assignment_date: string | null;
  status: string | null;
  service_details: string | null;
  customer_address: string | null;
};

type TimeEntry = {
  id: string;
  employee_id: string;
  booking_id: string | null;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  notes: string | null;
};

export default function EmployeeDashboard() {
  const { profile, signOut } = useAuth();
  const [todaysJobs, setTodaysJobs] = useState<Booking[]>([]);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [isClocked, setIsClocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedJobForPhoto, setSelectedJobForPhoto] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (profile?.id) {
      fetchTodaysJobs();
      checkClockStatus();
    }
  }, [profile?.id]);

  const fetchTodaysJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('booking')
        .select('*')
        .eq('assigned_employee_id', profile?.id)
        .or(`preferred_date.eq.${today},assignment_date.eq.${today}`)
        .order('created_at');

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      setTodaysJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Set empty array instead of leaving in error state
      setTodaysJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const checkClockStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', profile?.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Time entries database error:', error);
        // If table doesn't exist or access denied, just continue without clock status
        setIsClocked(false);
        return;
      }
      
      if (data && data.length > 0) {
        setCurrentTimeEntry(data[0]);
        setIsClocked(true);
      }
    } catch (error) {
      console.error('Error checking clock status:', error);
      setIsClocked(false);
    }
  };

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: profile?.id,
          clock_in: new Date().toISOString(),
          notes: 'Clocked in from dashboard'
        })
        .select()
        .single();

      if (error) {
        console.error('Clock in database error:', error);
        throw error;
      }
      setCurrentTimeEntry(data);
      setIsClocked(true);
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in. Time tracking may not be set up yet.');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentTimeEntry) return;
    
    setClockLoading(true);
    try {
      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(currentTimeEntry.clock_in);
      const totalHours = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOutTime,
          total_hours: Math.round(totalHours * 100) / 100,
          notes: currentTimeEntry.notes + ' | Clocked out from dashboard'
        })
        .eq('id', currentTimeEntry.id);

      if (error) throw error;
      
      setCurrentTimeEntry(null);
      setIsClocked(false);
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out. Please try again.');
    } finally {
      setClockLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('booking')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      
      // Refresh jobs
      fetchTodaysJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status.');
    }
  };

  const handlePhotoUpload = async (jobId: string) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select photos to upload');
      return;
    }

    setUploadLoading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `job-photos/${jobId}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('job-photos')
          .upload(filePath, file);

        if (error) throw error;
        return { path: data.path, fileName: file.name };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Save photo records to database
      const photoRecords = uploadResults.map(result => ({
        booking_id: jobId,
        employee_id: profile?.id,
        file_path: result.path,
        file_name: result.fileName,
        uploaded_at: new Date().toISOString()
      }));

      const { error: dbError } = await supabase
        .from('job_photos')
        .insert(photoRecords);

      if (dbError) {
        console.error('Database error:', dbError);
        // Still consider it successful if storage upload worked
      }

      alert(`Successfully uploaded ${uploadResults.length} photo(s)`);
      setSelectedFiles(null);
      setSelectedJobForPhoto(null);
      
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const addJobNote = async (jobId: string, note: string) => {
    if (!note.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      const { error } = await supabase
        .from('job_notes')
        .insert({
          booking_id: jobId,
          employee_id: profile?.id,
          note: note.trim(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database error:', error);
        // Fall back to updating the booking notes field
        const { error: updateError } = await supabase
          .from('booking')
          .update({ 
            notes: note.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);

        if (updateError) throw updateError;
      }

      alert('Note added successfully');
      setNoteText('');
      setSelectedJobForPhoto(null);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['employee', 'Employee']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#255756]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['employee', 'Employee']}>
      <div className="min-h-screen p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#255756] mb-2">Employee Dashboard</h1>
            <p className="text-gray-600">
              Welcome, {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button 
            onClick={async () => { await signOut(); window.location.assign("/"); }}
            className="px-4 py-2 text-sm border border-[#255756] text-[#255756] hover:bg-[#255756] hover:text-white rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{todaysJobs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todaysJobs.filter(job => (job.status || 'Pending') === 'Completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {isClocked ? 'Clocked In' : 'Clocked Out'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todaysJobs.filter(job => ['Pending', 'In Progress'].includes(job.status || 'Pending')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Tracking */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-[#255756] mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Time Tracking
            </h2>
            <div className="space-y-4">
              {isClocked && currentTimeEntry && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Clocked in at {format(new Date(currentTimeEntry.clock_in), 'h:mm a')}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Duration: {Math.floor((new Date().getTime() - new Date(currentTimeEntry.clock_in).getTime()) / (1000 * 60))} minutes
                  </p>
                </div>
              )}
              
              <button
                onClick={isClocked ? handleClockOut : handleClockIn}
                disabled={clockLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isClocked
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } ${clockLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {clockLoading ? 'Processing...' : isClocked ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-[#255756] mb-4 flex items-center">
              <Wrench className="mr-2" size={20} />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded border hover:bg-gray-50 flex items-center">
                <Calendar className="mr-3" size={16} />
                View Full Calendar
              </button>
              <button className="w-full text-left p-3 rounded border hover:bg-gray-50 flex items-center">
                <Wrench className="mr-3" size={16} />
                Log Materials Used
              </button>
              <button className="w-full text-left p-3 rounded border hover:bg-gray-50 flex items-center">
                <MessageSquare className="mr-3" size={16} />
                Report Issue
              </button>
              <button className="w-full text-left p-3 rounded border hover:bg-gray-50 flex items-center">
                <AlertTriangle className="mr-3" size={16} />
                Request Help
              </button>
            </div>
          </div>

          {/* Communication Center */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-[#255756] mb-4 flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Communication Center
            </h2>
            <div className="space-y-4">
              {/* Quick Communication Actions */}
              <div className="grid grid-cols-1 gap-2">
                <button className="w-full text-left p-3 rounded border hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="mr-3 text-blue-500" size={16} />
                    <span className="text-sm font-medium">Call Office</span>
                  </div>
                  <span className="text-xs text-gray-500">Emergency: 911</span>
                </button>
                <button className="w-full text-left p-3 rounded border hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-3 text-green-500" size={16} />
                    <span className="text-sm font-medium">Message Supervisor</span>
                  </div>
                  <span className="text-xs text-gray-500">Non-urgent</span>
                </button>
              </div>

              {/* Recent Messages/Updates */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Updates</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded text-xs">
                    <p className="font-medium text-blue-800">Schedule Change</p>
                    <p className="text-blue-700">Tomorrow&apos;s 2PM job moved to 3PM</p>
                    <p className="text-blue-600 mt-1">30 min ago</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-xs">
                    <p className="font-medium text-green-800">Safety Alert</p>
                    <p className="text-green-700">New safety protocols for ladder use</p>
                    <p className="text-green-600 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Jobs */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-[#255756] flex items-center">
              <Calendar className="mr-2" size={20} />
              Today&apos;s Schedule ({todaysJobs.length} jobs)
            </h2>
          </div>
          
          <div className="p-6">
            {todaysJobs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No jobs scheduled for today</p>
                <p className="text-sm text-gray-400">Enjoy your day off or check with your supervisor!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.service_type}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Clock className="mr-1" size={14} />
                          {job.preferred_date || job.assignment_date || 'Date TBD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <User className="mr-1" size={14} />
                          {job.customer_name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Phone className="mr-1" size={14} />
                          {job.customer_phone || 'No phone'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="mr-1" size={14} />
                          {job.customer_address || 'Address not provided'}
                        </p>
                      </div>
                    </div>
                    
                    {job.service_details && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Job Details:</p>
                        <p className="text-sm text-gray-600">{job.service_details}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(job.status || 'Pending') === 'Pending' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'In Progress')}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Start Job
                        </button>
                      )}
                      {job.status === 'In Progress' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'Completed')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedJobForPhoto(selectedJobForPhoto === job.id ? null : job.id)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 flex items-center"
                      >
                        <Camera className="w-3 h-3 mr-1" />
                        Photos
                      </button>
                      <button 
                        onClick={() => setSelectedJobForPhoto(selectedJobForPhoto === job.id ? null : job.id)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 flex items-center"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Notes
                      </button>
                    </div>

                    {/* Photo Upload and Notes Section */}
                    {selectedJobForPhoto === job.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Photo Upload */}
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                              <Camera className="w-4 h-4 mr-2" />
                              Upload Job Photos
                            </h4>
                            <div className="space-y-3">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {selectedFiles && selectedFiles.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  {selectedFiles.length} file(s) selected
                                </div>
                              )}
                              <button
                                onClick={() => handlePhotoUpload(job.id)}
                                disabled={!selectedFiles || uploadLoading}
                                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {uploadLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Photos
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Add Notes */}
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Add Job Notes
                            </h4>
                            <div className="space-y-3">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Enter job notes, observations, or updates..."
                                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                              />
                              <button
                                onClick={() => addJobNote(job.id, noteText)}
                                disabled={!noteText.trim()}
                                className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Add Note
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}