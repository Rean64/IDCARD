import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Smartphone,
  Banknote,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees?: string;
}

interface PaymentProcessingProps {
  amount: number;
  applicationId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  amount,
  applicationId,
  onBack,
  onSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [mobileDetails, setMobileDetails] = useState({
    phoneNumber: '',
    provider: ''
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Pay with Visa, Mastercard, or other major cards',
      processingTime: 'Instant',
      fees: 'No additional fees'
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'MTN Mobile Money, Orange Money, Express Union',
      processingTime: '1-5 minutes',
      fees: '1.5% transaction fee'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <Banknote className="h-6 w-6" />,
      description: 'Direct transfer from your bank account',
      processingTime: '24-48 hours',
      fees: 'No additional fees'
    }
  ];

  const mobileProviders = [
    { id: 'mtn', name: 'MTN Mobile Money', prefix: '67' },
    { id: 'orange', name: 'Orange Money', prefix: '69' },
    { id: 'express', name: 'Express Union Mobile', prefix: '62' }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const proceedToPayment = () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setPaymentStep('details');
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');
      toast.success('Payment processed successfully!');
    }, 3000);
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Required</h2>
        <p className="text-muted-foreground">
          Complete your payment to process your ID card application
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="bg-slate-50">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Application Fee</span>
            <span className="text-2xl font-bold text-primary">{amount.toLocaleString()} FCFA</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Secure payment processing with 256-bit SSL encryption
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Payment Method</h3>
        <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
          {paymentMethods.map((method) => (
            <div key={method.id} className="space-y-2">
              <Label
                htmlFor={method.id}
                className="flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all"
                style={{
                  borderColor: selectedMethod === method.id ? 'var(--primary)' : 'var(--border)'
                }}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-primary">{method.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {method.processingTime}
                      </div>
                      {method.fees && (
                        <Badge variant="outline" className="text-xs">
                          {method.fees}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderPaymentDetails = () => {
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            {selectedMethodData?.icon}
          </div>
          <h2 className="text-2xl font-bold mb-2">{selectedMethodData?.name}</h2>
          <p className="text-muted-foreground">
            Enter your payment details to complete the transaction
          </p>
        </div>

        {selectedMethod === 'card' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        {selectedMethod === 'mobile' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="provider">Mobile Money Provider</Label>
              <select
                id="provider"
                value={mobileDetails.provider}
                onChange={(e) => setMobileDetails(prev => ({ ...prev, provider: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select provider</option>
                {mobileProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={mobileDetails.phoneNumber}
                onChange={(e) => setMobileDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Payment Instructions</p>
                  <p className="text-blue-700 mt-1">
                    After clicking "Pay Now", you'll receive an SMS prompt to authorize the payment 
                    on your mobile money account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'bank' && (
          <div className="max-w-md mx-auto">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-amber-800">Bank Transfer Instructions</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Bank:</span> United Bank for Africa (UBA)
                    </div>
                    <div>
                      <span className="font-medium">Account Name:</span> MINDEF ID Card Services
                    </div>
                    <div>
                      <span className="font-medium">Account Number:</span> 0123456789
                    </div>
                    <div>
                      <span className="font-medium">Reference:</span> {applicationId}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> {amount.toLocaleString()} FCFA
                    </div>
                  </div>
                  
                  <div className="text-xs text-amber-700 bg-amber-100 p-3 rounded">
                    <strong>Important:</strong> Please include the reference number in your transfer 
                    description to ensure proper processing of your application.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Summary */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span>Total Amount</span>
              <span className="text-xl font-bold text-primary">{amount.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProcessing = () => (
    <div className="text-center space-y-6 py-12">
      <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
        <CreditCard className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
        <p className="text-muted-foreground">
          Please wait while we process your payment. This may take a few moments.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-12">
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
        <p className="text-muted-foreground">
          Your payment has been processed successfully. You can now proceed to book your appointment.
        </p>
      </div>
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono">TXN-{Date.now()}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold">{amount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (paymentStep) {
      case 'method':
        return renderMethodSelection();
      case 'details':
        return renderPaymentDetails();
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="flex items-center"
              disabled={paymentStep === 'processing'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Application
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium">Payment Processing</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-medium">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          {paymentStep !== 'processing' && paymentStep !== 'success' && (
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (paymentStep === 'details') {
                    setPaymentStep('method');
                  } else {
                    onBack();
                  }
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {paymentStep === 'details' ? 'Change Method' : 'Back'}
              </Button>
              
              <Button 
                onClick={paymentStep === 'method' ? proceedToPayment : processPayment}
                disabled={!selectedMethod || (paymentStep === 'details' && selectedMethod === 'card' && !cardDetails.cardNumber)}
              >
                {paymentStep === 'method' ? 'Continue' : 'Pay Now'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="flex justify-center mt-8">
              <Button size="lg" onClick={onSuccess} className="px-8">
                Continue to Appointment Booking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};