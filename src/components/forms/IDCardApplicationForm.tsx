import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';

import { 
  Upload,
  CheckCircle,
  ArrowLeft,
  Save,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

interface IDCardApplicationFormProps {
  onViewChange: (view: string) => void;
}

export const IDCardApplicationForm: React.FC<IDCardApplicationFormProps> = ({ onViewChange }) => {
  const { user, createApplication } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Cameroonian',
    gender: '',
    maritalStatus: '',
    profession: '',
    address: '',
    phoneNumber: '',
    email: user?.email || ''
  });

  const [documents, setDocuments] = useState({
    photo: false,
    birthCertificate: false,
    proofOfAddress: false,
    passport: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDocumentUpload = (documentType: string) => {
    // Simulate file upload
    setDocuments(prev => ({ ...prev, [documentType]: true }));
    toast.success(`${documentType} uploaded successfully`);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'placeOfBirth', 
      'nationality', 'gender', 'maritalStatus', 'profession', 
      'address', 'phoneNumber', 'email'
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (Cameroon format)
    const phoneRegex = /^(\+237|237)?[67]\d{8}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Cameroon phone number';
    }

    // Date validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 120) {
        newErrors.dateOfBirth = 'Age must be between 16 and 120 years';
      }
    }

    // Document validation
    if (!documents.photo) {
      newErrors.photo = 'Photo is required';
    }
    if (!documents.birthCertificate) {
      newErrors.birthCertificate = 'Birth certificate is required';
    }
    if (!documents.proofOfAddress) {
      newErrors.proofOfAddress = 'Proof of address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    const applicationId = createApplication({
      userId: user?.id || '',
      status: 'draft',
      personalInfo: formData,
      documents: Object.fromEntries(
        Object.entries(documents).map(([key, value]) => [key, value ? 'uploaded' : ''])
      )
    });
    toast.success('Application saved as draft');
    onViewChange('dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationId = createApplication({
        userId: user?.id || '',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        personalInfo: formData,
        documents: Object.fromEntries(
          Object.entries(documents).map(([key, value]) => [key, value ? 'uploaded' : ''])
        )
      });
      
      toast.success('Application submitted successfully!');
      onViewChange('dashboard');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1>ID Card Application</h1>
          <p className="text-muted-foreground">
            Fill in your personal information and upload required documents
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  placeholder="City, Region"
                />
                {errors.placeOfBirth && (
                  <p className="text-sm text-destructive">{errors.placeOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) => handleInputChange('nationality', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cameroonian">Cameroonian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nationality && (
                  <p className="text-sm text-destructive">{errors.nationality}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status *</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => handleInputChange('maritalStatus', value)}
                >
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
                {errors.maritalStatus && (
                  <p className="text-sm text-destructive">{errors.maritalStatus}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profession *</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  placeholder="Enter your profession"
                />
                {errors.profession && (
                  <p className="text-sm text-destructive">{errors.profession}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'photo', label: 'Passport Photo', required: true },
                { key: 'birthCertificate', label: 'Birth Certificate', required: true },
                { key: 'proofOfAddress', label: 'Proof of Address', required: true },
                { key: 'passport', label: 'Passport (if available)', required: false }
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label>{doc.label} {doc.required && '*'}</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {documents[doc.key as keyof typeof documents] ? (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDocumentUpload(doc.key)}
                        >
                          Upload {doc.label}
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors[doc.key] && (
                    <p className="text-sm text-destructive">{errors[doc.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  );
};