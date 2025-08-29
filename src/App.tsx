
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import { AdminDashboard } from "./components/dashboard/AdminDashboard";
import {
  IDTypeSelection,
  IDCardType,
} from "./components/IDTypeSelection";
import { MultiStepApplicationForm } from "./components/forms/MultiStepApplicationForm";
import { PaymentProcessing } from "./components/PaymentProcessing";
import { AppointmentBooking } from "./components/AppointmentBooking";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Download,
} from "lucide-react";

type AppStep =
  | "landing"
  | "type-selection"
  | "application-form"
  | "payment"
  | "appointment"
  | "completion"
  | "admin-login"
  | "admin-dashboard";

interface ApplicationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  maritalStatus: string;
  profession: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  fatherName?: string;
  fatherProfession?: string;
  motherName?: string;
  motherProfession?: string;
  previousIdNumber?: string;
  expiryDate?: string;
  documents: {
    photo: File | null;
    birthCertificate: File | null;
    proofOfAddress: File | null;
    previousId: File | null;
    policeReport: File | null;
  };
}

function AppContent() {
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] =
    useState<AppStep>("landing");
  const [selectedIdType, setSelectedIdType] =
    useState<IDCardType | null>(null);
  const [applicationData, setApplicationData] =
    useState<ApplicationData | null>(null);
  const [applicationId, setApplicationId] =
    useState<string>("");

  // Calculate fee based on ID card type
  const getApplicationFee = (type: IDCardType): number => {
    switch (type) {
      case "first":
        return 10000;
      case "renewal":
        return 5000;
      case "lost":
        return 10000;
      case "damaged":
        return 7500;
      default:
        return 10000;
    }
  };

  const handleStartApplication = () => {
    setCurrentStep("type-selection");
  };

  const handleTypeSelection = (type: IDCardType) => {
    setSelectedIdType(type);
    setCurrentStep("application-form");
  };

  const handleApplicationSubmit = (data: ApplicationData) => {
    setApplicationData(data);
    const newApplicationId = `MINDEF-${Date.now()}`;
    setApplicationId(newApplicationId);

    // All ID card types now require payment
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = () => {
    setCurrentStep("appointment");
  };

  const handleAppointmentComplete = () => {
    setCurrentStep("completion");
  };

  const handleAdminLogin = () => {
    setCurrentStep("admin-login");
  };

  const handleBackToHome = () => {
    setCurrentStep("landing");
    setSelectedIdType(null);
    setApplicationData(null);
    setApplicationId("");
  };

  // Admin login view
  if (currentStep === "admin-login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="bg-white shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold">
                    MINDEF ID-CARD Admin
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Administrative Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Administrator
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-2"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  // Admin dashboard view
  if (user && user.role === "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="bg-white shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold">
                    MINDEF ID-CARD Admin
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Administrative Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Administrator
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-2"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  // Application completion view
  if (currentStep === "completion") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="bg-white shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="px-4 py-2">
                🎉 Application Complete
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-strong border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold mb-4">
                  Application Submitted Successfully! 🎉
                </h1>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Your ID card application has been completed
                  and is now being processed. You'll receive
                  updates via SMS and email throughout the
                  process.
                </p>

                <Card className="bg-slate-50 mb-8">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Application ID:
                        </span>
                        <p className="font-mono font-medium">
                          {applicationId}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Service Type:
                        </span>
                        <p className="font-medium capitalize">
                          {selectedIdType?.replace("-", " ")} ID
                          Card
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Applicant:
                        </span>
                        <p className="font-medium">
                          {applicationData?.firstName}{" "}
                          {applicationData?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Status:
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          Processing
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-lg">
                    What happens next?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800 mb-1">
                        1. Document Review
                      </div>
                      <div className="text-blue-700">
                        Your documents will be verified within
                        2-3 business days
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-1">
                        2. Biometric Appointment
                      </div>
                      <div className="text-green-700">
                        Attend your scheduled appointment for
                        data collection
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800 mb-1">
                        3. ID Card Production
                      </div>
                      <div className="text-purple-700">
                        Your ID card will be produced and ready
                        for collection
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-x-4">
                  <Button variant="outline" className="px-6">
                    <Download className="mr-2 h-4 w-4" />
                    Download Summary
                  </Button>
                  <Button
                    onClick={handleBackToHome}
                    className="px-6"
                  >
                    Apply for Another ID
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main application flow
  switch (currentStep) {
    case "landing":
      return (
        <LandingPage
          onStartApplication={handleStartApplication}
          onAdminLogin={handleAdminLogin}
        />
      );

    case "type-selection":
      return (
        <IDTypeSelection
          onBack={handleBackToHome}
          onNext={handleTypeSelection}
        />
      );

    case "application-form":
      return selectedIdType ? (
        <MultiStepApplicationForm
          idType={selectedIdType}
          onBack={() => setCurrentStep("type-selection")}
          onNext={handleApplicationSubmit}
        />
      ) : null;

    case "payment":
      return selectedIdType && applicationData ? (
        <PaymentProcessing
          amount={getApplicationFee(selectedIdType)}
          applicationId={applicationId}
          onBack={() => setCurrentStep("application-form")}
          onSuccess={handlePaymentSuccess}
        />
      ) : null;

    case "appointment":
      return (
        <AppointmentBooking
          applicationId={applicationId}
          onBack={() => setCurrentStep("payment")}
          onComplete={handleAppointmentComplete}
        />
      );

    default:
      return (
        <LandingPage
          onStartApplication={handleStartApplication}
          onAdminLogin={handleAdminLogin}
        />
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}