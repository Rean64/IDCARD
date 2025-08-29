import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  UserPlus,
  RefreshCw,
  UserX,
  Search,
  AlertCircle,
  Info,
  CreditCard
} from 'lucide-react';

export type IDCardType = 'first' | 'renewal' | 'lost' | 'damaged';

interface IDTypeSelectionProps {
  onBack: () => void;
  onNext: (type: IDCardType) => void;
}

export const IDTypeSelection: React.FC<IDTypeSelectionProps> = ({ onBack, onNext }) => {
  const [selectedType, setSelectedType] = useState<IDCardType | null>(null);

  const cardTypes = [
    {
      id: 'first' as IDCardType,
      icon: <UserPlus className="h-12 w-12" />,
      title: 'First ID Card',
      description: 'Apply for your first national identity card',
      color: 'from-blue-50 to-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
      fee: '10,000 FCFA',
      requirements: [
        'Birth certificate',
        'Passport photos',
        'Proof of nationality',
        'Proof of residence'
      ]
    },
    {
      id: 'renewal' as IDCardType,
      icon: <RefreshCw className="h-12 w-12" />,
      title: 'Renewal',
      description: 'Renew your expired or expiring ID card',
      color: 'from-green-50 to-green-100 border-green-200',
      iconColor: 'text-green-600',
      fee: '5,000 FCFA',
      requirements: [
        'Current/expired ID card',
        'Passport photos',
        'Proof of residence'
      ]
    },
    {
      id: 'lost' as IDCardType,
      icon: <UserX className="h-12 w-12" />,
      title: 'Lost/Stolen Card',
      description: 'Replace your lost or stolen ID card',
      color: 'from-red-50 to-red-100 border-red-200',
      iconColor: 'text-red-600',
      fee: '10,000 FCFA',
      requirements: [
        'Police report (for stolen)',
        'Birth certificate',
        'Passport photos',
        'Proof of residence',
        'Sworn declaration'
      ]
    },
    {
      id: 'damaged' as IDCardType,
      icon: <Search className="h-12 w-12" />,
      title: 'Damaged Card',
      description: 'Replace your damaged or defective ID card',
      color: 'from-purple-50 to-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
      fee: '7,500 FCFA',
      requirements: [
        'Damaged ID card',
        'Passport photos',
        'Proof of residence'
      ]
    }
  ];

  const selectedCard = cardTypes.find(card => card.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium">Select Service Type</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Select Your Service Type</h1>
            <p className="text-muted-foreground text-lg">
              Choose the type of ID card service you need to continue with your application
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {cardTypes.map((card) => (
              <Card
                key={card.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-medium border-2 ${
                  selectedType === card.id
                    ? 'ring-2 ring-primary ring-offset-2 shadow-medium'
                    : 'hover:-translate-y-1'
                } bg-gradient-to-br ${card.color}`}
                onClick={() => setSelectedType(card.id)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className={`flex-shrink-0 ${card.iconColor}`}>
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold">{card.title}</h3>
                        <Badge variant="outline" className="bg-white/80">
                          {card.fee}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{card.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                          Required Documents
                        </h4>
                        <ul className="space-y-1">
                          {card.requirements.map((req, index) => (
                            <li key={index} className="text-sm flex items-center">
                              <div className="w-1.5 h-1.5 bg-current rounded-full mr-3"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {selectedType === card.id && (
                    <div className="mt-6 pt-6 border-t border-black/10">
                      <div className="flex items-center text-primary text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Selected - Click Continue to proceed
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Service Info */}
          {selectedCard && (
            <Card className="mb-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Info className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Service Selected: {selectedCard.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedCard.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Fee: <strong>{selectedCard.fee}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Processing: <strong>5-7 business days</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              disabled={!selectedType}
              onClick={() => selectedType && onNext(selectedType)}
              className="px-8 py-3 text-lg shadow-medium hover:shadow-strong"
            >
              Continue to Application Form
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};