import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { IDCardType } from '../IDTypeSelection';
import { 
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle,
  User,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationData {
  // Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  maritalStatus: string;
  profession: string;
  nationality: string;
  
  // Contact Info
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Parent Info (for first-time applicants)
  fatherName?: string;
  fatherProfession?: string;
  motherName?: string;
  motherProfession?: string;
  
  // Previous ID Info (for renewal/replacement)
  previousIdNumber?: string;
  expiryDate?: string;
  
  // Documents
  documents: {
    photo: File | null;
    birthCertificate: File | null;
    proofOfAddress: File | null;
    previousId: File | null;
    policeReport: File | null;
  };
}

interface MultiStepApplicationFormProps {
  idType: IDCardType;
  onBack: () => void;
  onNext: (data: ApplicationData) => void;
}

export const MultiStepApplicationForm: React.FC<MultiStepApplicationFormProps> = ({
  idType,
  onBack,
  onNext
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    maritalStatus: '',
    profession: '',
    nationality: 'Cameroonian',
    phoneNumber: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    documents: {
      photo: null,
      birthCertificate: null,
      proofOfAddress: null,
      previousId: null,
      policeReport: null
    }
  });

  const getTotalSteps = () => {
    switch (idType) {
      case 'first':
        return 4; // Personal Info, Parent Info, Documents, Review
      case 'renewal':
        return 4; // Personal Info, Previous ID Info, Documents, Review
      case 'lost':
        return 4; // Personal Info, Previous ID Info, Documents, Review
      case 'damaged':
        return 4; // Personal Info, Previous ID Info, Documents, Review
      default:
        return 4;
    }
  };

  const getStepTitle = (step: number) => {
    const stepTitles = {
      1: 'Personal Information',
      2: idType === 'first' ? 'Parent Information' : 'Previous ID Information',
      3: 'Document Upload',
      4: 'Review & Submit'
    };
    return stepTitles[step as keyof typeof stepTitles];
  };

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (documentType: keyof ApplicationData['documents'], file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
    toast.success(`${documentType} uploaded successfully`);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth && 
                 formData.placeOfBirth && formData.gender && formData.phoneNumber && 
                 formData.email && formData.address);
      case 2:
        if (idType === 'first') {
          return !!(formData.fatherName && formData.motherName);
        } else {
          return !!(formData.previousIdNumber);
        }
      case 3:
        const requiredDocs = getRequiredDocuments();
        return requiredDocs.every(doc => formData.documents[doc]);
      default:
        return true;
    }
  };

  const getRequiredDocuments = (): (keyof ApplicationData['documents'])[] => {
    const base: (keyof ApplicationData['documents'])[] = ['photo', 'birthCertificate', 'proofOfAddress'];
    
    switch (idType) {
      case 'renewal':
      case 'damaged':
        return [...base, 'previousId'];
      case 'lost':
        return [...base, 'policeReport'];
      default:
        return base;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < getTotalSteps()) {
        setCurrentStep(currentStep + 1);
      } else {
        onNext(formData);
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return idType === 'first' ? renderParentInfoStep() : renderPreviousIdStep();
      case 3:
        return renderDocumentStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeOfBirth">Place of Birth *</Label>
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
            placeholder="City, Region, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Divorced">Divorced</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            placeholder="Your current profession"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cameroonian">Cameroonian</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Current Address *</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your complete current address"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Full name of emergency contact"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderParentInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Parent Information</h3>
        <p className="text-muted-foreground">
          This information is required for first-time ID card applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Father's Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Full Name *</Label>
              <Input
                id="fatherName"
                value={formData.fatherName || ''}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                placeholder="Father's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherProfession">Profession</Label>
              <Input
                id="fatherProfession"
                value={formData.fatherProfession || ''}
                onChange={(e) => handleInputChange('fatherProfession', e.target.value)}
                placeholder="Father's profession"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mother's Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motherName">Full Name *</Label>
              <Input
                id="motherName"
                value={formData.motherName || ''}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
                placeholder="Mother's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherProfession">Profession</Label>
              <Input
                id="motherProfession"
                value={formData.motherProfession || ''}
                onChange={(e) => handleInputChange('motherProfession', e.target.value)}
                placeholder="Mother's profession"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPreviousIdStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Previous ID Information</h3>
        <p className="text-muted-foreground">
          Please provide information about your previous ID card
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="previousIdNumber">Previous ID Number *</Label>
          <Input
            id="previousIdNumber"
            value={formData.previousIdNumber || ''}
            onChange={(e) => handleInputChange('previousIdNumber', e.target.value)}
            placeholder="Enter your previous ID card number"
          />
        </div>

        {(idType === 'renewal' || idType === 'damaged') && (
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>
        )}

        {idType === 'lost' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Lost/Stolen ID Card</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You will need to upload a police report as part of the required documents.
                  If you haven't filed a police report yet, please do so before continuing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDocumentStep = () => {
    const requiredDocs = getRequiredDocuments();
    
    const documentLabels = {
      photo: 'Passport Photo',
      birthCertificate: 'Birth Certificate',
      proofOfAddress: 'Proof of Address',
      previousId: 'Previous ID Card',
      policeReport: 'Police Report'
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Document Upload</h3>
          <p className="text-muted-foreground">
            Please upload all required documents. Files should be in JPG, PNG, or PDF format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredDocs.map((docType) => (
            <Card key={docType} className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-all">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{documentLabels[docType]} *</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Max size: 5MB • Format: JPG, PNG, PDF
                    </p>
                  </div>
                  
                  {formData.documents[docType] ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-green-600">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          {formData.documents[docType]!.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.documents[docType]!.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.jpg,.jpeg,.png,.pdf';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(docType, file);
                          };
                          input.click();
                        }}
                      >
                        Replace File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.jpg,.jpeg,.png,.pdf';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(docType, file);
                          };
                          input.click();
                        }}
                      >
                        Upload {documentLabels[docType]}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Review Your Application</h3>
        <p className="text-muted-foreground">
          Please review all information before submitting your application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date of Birth:</span>
                <p className="font-medium">{formData.dateOfBirth}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Place of Birth:</span>
                <p className="font-medium">{formData.placeOfBirth}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <p className="font-medium">{formData.gender}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{formData.phoneNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{formData.email}</p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Address:</span>
              <p className="font-medium text-sm">{formData.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRequiredDocuments().map((docType) => (
                <div key={docType} className="flex items-center justify-between py-2">
                  <span className="text-sm">{
                    {
                      photo: 'Passport Photo',
                      birthCertificate: 'Birth Certificate',
                      proofOfAddress: 'Proof of Address',
                      previousId: 'Previous ID Card',
                      policeReport: 'Police Report'
                    }[docType]
                  }</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={prevStep} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Back to Service Selection' : 'Previous Step'}
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentStep}
                </div>
                <span className="text-sm font-medium">{getStepTitle(currentStep)}</span>
              </div>
              <Badge variant="outline">
                Step {currentStep} of {getTotalSteps()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={(currentStep / getTotalSteps()) * 100} className="h-2" />
          </div>

          {/* Form Content */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-2xl">{getStepTitle(currentStep)}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Back to Selection' : 'Previous'}
            </Button>
            
            <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
              {currentStep === getTotalSteps() ? 'Submit Application' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};