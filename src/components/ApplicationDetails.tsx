import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { IDCardTemplate } from './cards/IDCardTemplate';
import { 
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface ApplicationDetailsProps {
  onViewChange: (view: string) => void;
}

export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ onViewChange }) => {
  const { user, getUserApplications } = useAuth();
  const userApplications = getUserApplications(user?.id || '');
  
  // For demo purposes, show the latest application
  const application = userApplications[userApplications.length - 1];

  if (!application) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Application Found</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any applications yet.
        </p>
        <Button onClick={() => onViewChange('application')}>
          Create New Application
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="h-5 w-5" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
      case 'under_review':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => onViewChange('dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1>Application Details</h1>
          <p className="text-muted-foreground">
            View your ID card application information and preview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(application.status)}
                  <span>Application Status</span>
                </CardTitle>
                <Badge variant={getStatusColor(application.status)}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Application ID</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {application.id}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(application.createdAt)}</span>
                  </div>
                  {application.submittedAt && (
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <span>{formatDate(application.submittedAt)}</span>
                    </div>
                  )}
                  {application.reviewedAt && (
                    <div className="flex justify-between">
                      <span>Reviewed:</span>
                      <span>{formatDate(application.reviewedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {application.status === 'rejected' && application.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <h4 className="font-medium text-red-800 mb-1">Rejection Reason</h4>
                  <p className="text-sm text-red-700">{application.rejectionReason}</p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Application Approved!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your ID card is ready for collection at the nearest government office.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Full Name</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.personalInfo.firstName} {application.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Date of Birth</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(application.personalInfo.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Place of Birth</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.personalInfo.placeOfBirth}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Nationality</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.personalInfo.nationality}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Gender</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.personalInfo.gender}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Marital Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.personalInfo.maritalStatus}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-1">Profession</h4>
                <p className="text-sm text-muted-foreground">
                  {application.personalInfo.profession}
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.personalInfo.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.personalInfo.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.personalInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(application.documents).map(([doc, status]) => (
                  status && (
                    <Badge key={doc} variant="outline" className="justify-center">
                      {doc.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ID Card Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ID Card Preview</CardTitle>
                {application.status === 'approved' && (
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <IDCardTemplate application={application} />
            </CardContent>
          </Card>

          {application.status === 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle>Collection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Visit the nearest government office</li>
                    <li>• Bring this application reference: {application.id}</li>
                    <li>• Present a valid form of identification</li>
                    <li>• Collection hours: Monday - Friday, 8:00 AM - 4:00 PM</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Collection Centers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="border rounded p-2">
                      <p className="font-medium">Central Registry Office - Yaoundé</p>
                      <p className="text-muted-foreground">Avenue Kennedy, Yaoundé Centre</p>
                    </div>
                    <div className="border rounded p-2">
                      <p className="font-medium">Regional Office - Douala</p>
                      <p className="text-muted-foreground">Boulevard de la Liberté, Douala</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};