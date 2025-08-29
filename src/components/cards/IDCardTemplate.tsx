import React from 'react';
import { Application } from '../../contexts/AuthContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, Award, CheckCircle, Clock } from 'lucide-react';

interface IDCardTemplateProps {
  application: Application;
}

export const IDCardTemplate: React.FC<IDCardTemplateProps> = ({ application }) => {
  const { personalInfo } = application;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getCardNumber = () => {
    return `MINDEF-${application.id.slice(-8).toUpperCase()}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Front of ID Card */}
      <Card className="bg-gradient-to-br from-gray-100 via-white to-gray-200 text-gray-800 p-6 aspect-[3.375/2.125] relative overflow-hidden shadow-2xl border-0">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-900 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Header */}
        <div className="text-center mb-4 relative z-10">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Shield className="h-5 w-5 text-blue-900" />
            <div className="text-xs font-bold tracking-wider text-blue-900">RÉPUBLIQUE DU CAMEROUN</div>
          </div>
          <div className="text-[10px] mb-1 opacity-80">Peace • Work • Fatherland</div>
          <div className="text-xs font-bold tracking-wide text-blue-900">MINISTRY OF DEFENSE</div>
          <div className="text-xs font-semibold flex items-center justify-center">EMPLOYEE IDENTITY CARD <CheckCircle className="w-3 h-3 ml-1 text-green-500"/></div>
        </div>

        {/* Content */}
        <div className="flex items-start space-x-4 relative z-10">
          {/* Photo */}
          <div className="w-32 h-32 bg-white rounded-lg shadow-lg overflow-hidden border-2 pb-3 border-blue-900">
            {application.documents.photo ? (
              <img 
                src={application.documents.photo} 
                alt="Applicant Photo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">No Photo</span>
              </div>
            )}
          </div>

          {/* Personal info */}
          <div className="flex-1 flex flex-col justify-between h-32 text-xs pb-3">
            <div>
              <div className="font-bold text-gray-500 text-[10px]">NAME / NOM:</div>
              <div className="font-semibold text-sm">{personalInfo.lastName.toUpperCase()}</div>
            </div>
            <div>
              <div className="font-bold text-gray-500 text-[10px]">GIVEN NAME / PRÉNOM:</div>
              <div className="font-semibold">{personalInfo.firstName}</div>
            </div>
            <div className="flex space-x-4">
              <div>
                <div className="font-bold text-gray-500 text-[10px]">DOB / NÉ(E) LE:</div>
                <div>{formatDate(personalInfo.dateOfBirth)}</div>
              </div>
              <div>
                <div className="font-bold text-gray-500 text-[10px]">PLACE / LIEU:</div>
                <div>{personalInfo.placeOfBirth}</div>
              </div>
              <div>
                <div className="font-bold text-gray-500 text-[10px]">GENDER / SEXE:</div>
                <div>{personalInfo.gender}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ID Number */}
        <div className="absolute bottom-2 left-6 right-6 relative z-10">
          <div className="text-center">
            <div className="text-xs font-bold tracking-widest bg-blue-900/10 backdrop-blur-sm rounded px-2 py-1 text-blue-900">
              ID: {getCardNumber()}
            </div>
          </div>
        </div>

        {/* Cameroon flag colors accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-red-500 to-yellow-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-red-500 to-yellow-500"></div>
      </Card>

      {/* Back of ID Card */}
      <Card className="bg-white text-gray-800 p-6 aspect-[3.375/2.125] relative overflow-hidden shadow-2xl border border-gray-200">
        {/* Magnetic Stripe */}
        <div className="absolute top-4 left-0 w-full h-10 bg-gray-800"></div>

        {/* Content */}
        <div className="relative z-10 mt-12">
          <div className="flex space-x-6">
            <div className="w-2/3 space-y-2 text-xs">
              <div>
                <div className="font-bold text-gray-500 text-[10px]">DEPARTMENT / DÉPARTEMENT:</div>
                <div className="font-medium">{personalInfo.profession}</div>
              </div>
              <div>
                <div className="font-bold text-gray-500 text-[10px]">ADDRESS / DOMICILE:</div>
                <div className="leading-tight text-xs">{personalInfo.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="font-bold text-gray-500 text-[10px]">NATIONALITY:</div>
                  <div className="font-medium">{personalInfo.nationality}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-500 text-[10px]">STATUS:</div>
                  <div className="font-medium">{personalInfo.maritalStatus}</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-gray-500 text-[10px]">EMERGENCY CONTACT:</div>
                <div className="text-xs">{personalInfo.phoneNumber}</div>
              </div>
            </div>
            <div className="w-1/3 flex flex-col items-center">
              {/* QR Code Placeholder */}
              <div className="w-24 h-24 bg-gray-100 border flex items-center justify-center">
                <span className="text-[10px] text-gray-400">QR CODE</span>
              </div>
              <div className="text-[8px] text-center mt-1 text-gray-500">Scan for verification</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="font-bold text-gray-500 text-[10px]">AUTHORIZED SIGNATURE:</div>
            <div className="h-8 border-b-2 border-gray-300 mt-1"></div>
          </div>
        </div>

        {/* Issue date and validity */}
        <div className="absolute bottom-2 left-6 right-6 relative z-10">
          <div className="flex justify-between text-[10px]">
            <div>
              <div className="font-bold text-gray-500">ISSUED:</div>
              <div>{formatDate(new Date().toISOString())}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-500">EXPIRES:</div>
              <div>{formatDate(new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString())}</div>
            </div>
          </div>
        </div>

        {/* Cameroon flag colors accent */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-red-500 to-yellow-500"></div>
      </Card>

      {/* Status indicator */}
      <div className="text-center">
        <Badge 
          variant={application.status === 'approved' ? 'default' : 'secondary'}
          className="text-sm px-4 py-2"
        >
          {application.status === 'approved' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Ready for Collection
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Pending Approval
            </>
          )}
        </Badge>
      </div>
    </div>
  );
};