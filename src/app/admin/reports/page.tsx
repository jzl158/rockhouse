'use client';

import { useState, useEffect } from 'react';
import { fetchSavedReports, fetchReportTemplates, fetchReportSchedules, ReportTypes } from './reportHelpers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Plus, Calendar, Clock, FileText, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reportsData, templatesData, schedulesData] = await Promise.all([
          fetchSavedReports(),
          fetchReportTemplates(),
          fetchReportSchedules()
        ]);

        setSavedReports(reportsData);
        setTemplates(templatesData);
        setSchedules(schedulesData);
        setError(null);
      } catch (err) {
        setError('Failed to load reports data');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex gap-2">
          <Link href="/admin/reports/templates/new">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </Link>
          <Link href="/admin/reports/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="saved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="saved">
            <FileText className="h-4 w-4 mr-2" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4">
          {savedReports.map(report => (
            <Link key={report.id} href={`/admin/reports/${report.id}`}>
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{report.template?.report_type}</Badge>
                      {report.last_run_at && (
                        <p className="text-xs text-gray-500">
                          Last run: {format(new Date(report.last_run_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Run Report
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.map(template => (
            <Card key={template.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.is_system_template && (
                      <Badge>System</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <Badge variant="outline" className="mt-2">{template.report_type}</Badge>
                </div>
                <Link href={`/admin/reports/new?template=${template.id}`}>
                  <Button variant="ghost" size="sm">
                    Use Template
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {schedules.map(schedule => (
            <Card key={schedule.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{schedule.saved_report.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{schedule.frequency}</Badge>
                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-600">
                        Next run: {format(new Date(schedule.next_run_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit Schedule
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}