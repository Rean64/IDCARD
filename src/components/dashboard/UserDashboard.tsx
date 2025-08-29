import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Eye,
  TrendingUp,
  Shield,
  Award,
  User
} from 'lucide-react';

interface UserDashboardProps {
  onViewChange: (view: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onViewChange }) => {
  const { user, getUserApplications } = useAuth();
  const userApplications = getUserApplications(user?.id || '');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'draft':
        return 25;
      case 'submitted':
        return 50;
      case 'under_review':
        return 75;
      case 'approved':
        return 100;
      case 'rejected':
        return 100;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your ID card applications and track progress
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="outline" className="text-xs">
                  <Shield className="mr-1 h-3 w-3" />
                  MINDEF Personnel
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Award className="mr-1 h-3 w-3" />
                  Verified Account
                </Badge>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => onViewChange('application')}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-300 px-8"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Application
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700">Total Applications</CardTitle>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">{userApplications.length}</div>
            <div className="flex items-center text-xs text-blue-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              ID card requests
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700">Approved</CardTitle>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {userApplications.filter(app => app.status === 'approved').length}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Ready for collection
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700">Pending</CardTitle>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {userApplications.filter(app => 
                ['submitted', 'under_review'].includes(app.status)
              ).length}
            </div>
            <div className="flex items-center text-xs text-orange-600">
              <Clock className="mr-1 h-3 w-3" />
              Under review
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700">Processing Time</CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">3-5</div>
            <div className="flex items-center text-xs text-purple-600">
              <Clock className="mr-1 h-3 w-3" />
              Business days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-xl">
          <CardTitle className="text-xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            My Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {userApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No applications yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your ID card application process today. Our streamlined system 
                makes it quick and easy to get your employee identification.
              </p>
              <Button 
                onClick={() => onViewChange('application')}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Application
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {userApplications.map((application) => (
                <div 
                  key={application.id}
                  className="bg-white border border-border/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getStatusIcon(application.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">
                          ID Card Application #{application.id.slice(-8).toUpperCase()}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(application.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={getStatusColor(application.status)}
                        className="px-3 py-1 text-xs font-medium"
                      >
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewChange('details')}
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progress</span>
                      <span className="text-primary">{getProgressPercentage(application.status)}%</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(application.status)} 
                      className="h-2"
                    />
                  </div>

                  {application.status === 'rejected' && application.rejectionReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-800 mb-2">
                        <XCircle className="h-4 w-4" />
                        <span className="font-medium">Application Rejected</span>
                      </div>
                      <p className="text-sm text-red-700">{application.rejectionReason}</p>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Application Approved!</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Your ID card is ready for collection at the nearest MINDEF office.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};