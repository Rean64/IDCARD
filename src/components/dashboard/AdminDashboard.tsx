import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Application } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { IDCardTemplate } from '../cards/IDCardTemplate';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  CreditCard,
  Calendar,
  Check,
  X,
  Eye,
  Download,
  Filter,
  Search,
  RefreshCw,
  UserPlus,
  UserX,
  TrendingUp,
  DollarSign,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { getAllApplications } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewedApplication, setViewedApplication] = useState<Application | null>(null);

  // Mock data for enhanced features
  const mockApplications = [
    {
      id: 'MINDEF-1735186234567',
      applicationId: 'MINDEF-1735186234567',
      status: 'pending_review',
      submittedAt: '2024-12-26T10:30:00Z',
      createdAt: '2024-12-26T10:30:00Z',
      updatedAt: '2024-12-26T10:30:00Z',
      personalInfo: {
        firstName: 'Jean Baptiste',
        lastName: 'Nkomo',
        dateOfBirth: '2000-01-01',
        placeOfBirth: 'Yaounde',
        nationality: 'Cameroonian',
        gender: 'Male',
        maritalStatus: 'Single',
        profession: 'Engineer',
        address: '123 Main St, Yaounde',
        phoneNumber: '+237 670123456',
        email: 'jean.nkomo@email.com',
      },
      documents: {
        photo: 'uploaded',
        birthCertificate: 'uploaded',
        proofOfAddress: 'uploaded',
      },
    },
    {
      id: 'MINDEF-1735186234568',
      applicationId: 'MINDEF-1735186234568',
      status: 'document_review',
      submittedAt: '2024-12-25T14:15:00Z',
      createdAt: '2024-12-25T14:15:00Z',
      updatedAt: '2024-12-25T14:15:00Z',
      personalInfo: {
        firstName: 'Marie Claire',
        lastName: 'Mbanga',
        dateOfBirth: '1995-05-10',
        placeOfBirth: 'Douala',
        nationality: 'Cameroonian',
        gender: 'Female',
        maritalStatus: 'Married',
        profession: 'Teacher',
        address: '456 Oak Ave, Douala',
        phoneNumber: '+237 695876543',
        email: 'marie.mbanga@email.com',
      },
      documents: {
        photo: 'uploaded',
        previousId: 'uploaded',
        proofOfAddress: 'uploaded',
      },
    },
    {
      id: 'MINDEF-1735186234569',
      applicationId: 'MINDEF-1735186234569',
      status: 'payment_pending',
      submittedAt: '2024-12-26T16:45:00Z',
      createdAt: '2024-12-26T16:45:00Z',
      updatedAt: '2024-12-26T16:45:00Z',
      personalInfo: {
        firstName: 'Paul',
        lastName: 'Kamga',
        dateOfBirth: '1988-11-20',
        placeOfBirth: 'Bafoussam',
        nationality: 'Cameroonian',
        gender: 'Male',
        maritalStatus: 'Single',
        profession: 'Doctor',
        address: '789 Pine Rd, Bafoussam',
        phoneNumber: '+237 654321098',
        email: 'paul.kamga@email.com',
      },
      documents: {
        photo: 'uploaded',
        birthCertificate: 'uploaded',
        policeReport: 'uploaded',
        proofOfAddress: 'uploaded',
      },
    }
  ];

  const allApplications = [...getAllApplications(), ...mockApplications];

  const getApplicationsByStatus = (status: string) => {
    return allApplications.filter(app => {
      if (typeof app.status === 'string') {
        return app.status === status;
      }
      return false;
    });
  };

  const getApplicationsByType = (type: string) => {
    return allApplications.filter(app => 
      'idType' in app ? app.idType === type : false
    );
  };

  const getTotalRevenue = () => {
    return allApplications
      .filter(app => 'paymentStatus' in app && app.paymentStatus === 'completed')
      .reduce((total, app) => total + ('paymentAmount' in app ? app.paymentAmount : 0), 0);
  };

  const getUpcomingAppointments = () => {
    return allApplications
      .filter(app => 'appointmentDate' in app && app.appointmentDate)
      .sort((a, b) => {
        const dateA = new Date('appointmentDate' in a ? a.appointmentDate! : 0);
        const dateB = new Date('appointmentDate' in b ? b.appointmentDate! : 0);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'submitted':
      case 'pending_review':
      case 'document_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'payment_pending':
        return <CreditCard className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
      case 'pending_review':
      case 'document_review':
        return 'default';
      case 'payment_pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'first':
        return <UserPlus className="h-4 w-4" />;
      case 'renewal':
        return <RefreshCw className="h-4 w-4" />;
      case 'lost':
        return <UserX className="h-4 w-4" />;
      case 'damaged':
        return <Search className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{allApplications.length}</div>
                <div className="text-sm text-blue-600">Total Applications</div>
              </div>
            </div>
            <div className="flex items-center text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalRevenue())}</div>
                <div className="text-sm text-green-600">Revenue</div>
              </div>
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {getApplicationsByStatus('pending_review').length + getApplicationsByStatus('document_review').length}
                </div>
                <div className="text-sm text-orange-600">Pending Review</div>
              </div>
            </div>
            <div className="flex items-center text-xs text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{getUpcomingAppointments().length}</div>
                <div className="text-sm text-purple-600">Today's Appointments</div>
              </div>
            </div>
            <div className="flex items-center text-xs text-purple-600">
              <Calendar className="h-3 w-3 mr-1" />
              Scheduled for today
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Application Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['first', 'renewal', 'lost', 'damaged'].map(type => (
              <div key={type} className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getTypeIcon(type)}
                  <span className="ml-2 text-sm font-medium capitalize">
                    {type === 'lost' ? 'Lost/Stolen' : type}
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {getApplicationsByType(type).length}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allApplications.slice(0, 5).map((application) => (
              <div 
                key={application.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center space-x-4">
                  {'idType' in application && getTypeIcon(application.idType)}
                  <div>
                    <p className="font-medium">
                      {'applicantName' in application 
                        ? application.applicantName 
                        : `${application.personalInfo.firstName} ${application.personalInfo.lastName}`
                      }
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>ID: {application.id.slice(-8)}</span>
                      <span>•</span>
                      <span>{'idType' in application ? application.idType : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {'paymentStatus' in application && (
                    <Badge variant={application.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                      💰 {application.paymentStatus === 'completed' 
                        ? `Paid ${formatCurrency(application.paymentAmount)}` 
                        : `${formatCurrency(application.paymentAmount)} Due`}
                    </Badge>
                  )}
                  <Badge variant={getStatusColor(typeof application.status === 'string' ? application.status : 'draft')}>
                    {typeof application.status === 'string' ? application.status.replace('_', ' ').toUpperCase() : 'DRAFT'}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setViewedApplication(application as Application)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Applications</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {allApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-medium transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {'idType' in application && getTypeIcon(application.idType)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {'applicantName' in application 
                        ? application.applicantName 
                        : `${application.personalInfo.firstName} ${application.personalInfo.lastName}`
                      }
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Application #{application.id.slice(-8)} • 
                      {'idType' in application && (
                        <span className="capitalize ml-1">
                          {application.idType === 'lost' ? 'Lost/Stolen' : application.idType} ID Card
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {'paymentStatus' in application && (
                    <Badge variant={application.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                      💰 {application.paymentStatus === 'completed' 
                        ? `Paid ${formatCurrency(application.paymentAmount)}` 
                        : `${formatCurrency(application.paymentAmount)} Due`}
                    </Badge>
                  )}
                  <Badge variant={getStatusColor(typeof application.status === 'string' ? application.status : 'draft')}>
                    {typeof application.status === 'string' ? application.status.replace('_', ' ').toUpperCase() : 'DRAFT'}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setViewedApplication(application as Application)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Contact:</span>
                  <p>{'email' in application ? application.email : application.personalInfo.email}</p>
                  <p>{'phone' in application ? application.phone : application.personalInfo.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p>{formatDate(('submittedAt' in application && application.submittedAt) ? application.submittedAt : application.createdAt)}</p>
                  {'appointmentDate' in application && application.appointmentDate && (
                    <>
                      <span className="text-muted-foreground">Appointment:</span>
                      <p>{formatDate(application.appointmentDate || '')}</p>
                    </>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Documents:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(application.documents) ? application.documents : Object.values(application.documents))
                      .slice(0, 3).map((doc: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {doc.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {(typeof application.status === 'string' && 
                ['pending_review', 'document_review'].includes(application.status)) && (
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                  <Button size="sm" onClick={() => toast.success('Application approved')}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedApplication(application.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              {selectedApplication === application.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        toast.success('Application rejected');
                        setSelectedApplication(null);
                        setRejectionReason('');
                      }}
                    >
                      Confirm Rejection
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(null);
                        setRejectionReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <div className="flex items-center space-x-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(getTotalRevenue())}</div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['completed', 'pending', 'failed'].map(status => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{status} Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allApplications
                  .filter(app => 'paymentStatus' in app && app.paymentStatus === status)
                  .slice(0, 5)
                  .map(app => (
                    <div key={app.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <p className="font-medium text-sm">
                          {'applicantName' in app ? app.applicantName : 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.id.slice(-8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {'paymentAmount' in app && formatCurrency(app.paymentAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {('submittedAt' in app && app.submittedAt) ? formatDate(app.submittedAt) : (('createdAt' in (app as Application) && (app as Application).createdAt) ? formatDate((app as Application).createdAt) : '')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointment Management</h2>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Calendar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getUpcomingAppointments().map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {'applicantName' in appointment ? appointment.applicantName : 'Unknown'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {'appointmentDate' in appointment && appointment.appointmentDate && 
                        formatDate(appointment.appointmentDate || '')
                      } • {'location' in appointment && appointment.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {'idType' in appointment && (
                    <Badge variant="outline">
                      {appointment.idType === 'lost' ? 'Lost/Stolen' : appointment.idType}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage ID card applications, payments, and appointments
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          🛡️ MINDEF Admin Portal
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          {renderApplications()}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          {renderPayments()}
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          {renderAppointments()}
        </TabsContent>
      </Tabs>

      {viewedApplication && (
        <Dialog open={!!viewedApplication} onOpenChange={() => setViewedApplication(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>ID Card Preview</DialogTitle>
            </DialogHeader>
            <IDCardTemplate application={viewedApplication} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};