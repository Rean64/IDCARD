import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { 
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
  Users,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  capacity: number;
  booked: number;
}

interface Location {
  id: string;
  name: string;
  address: string;
  district: string;
  availableDays: number[];
  workingHours: string;
}

interface AppointmentBookingProps {
  applicationId: string;
  onBack: () => void;
  onComplete: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  applicationId,
  onBack,
  onComplete
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingStep, setBookingStep] = useState<'location' | 'datetime' | 'confirmation' | 'success'>('location');
  const [isBooking, setIsBooking] = useState(false);

  const locations: Location[] = [
    {
      id: 'yaounde-central',
      name: 'MINDEF Central Office',
      address: 'Avenue Kennedy, Yaoundé Centre',
      district: 'Yaoundé',
      availableDays: [1, 2, 3, 4, 5], // Monday to Friday
      workingHours: '8:00 AM - 4:00 PM'
    },
    {
      id: 'douala-office',
      name: 'MINDEF Douala Regional Office',
      address: 'Boulevard de la Liberté, Douala',
      district: 'Douala',
      availableDays: [1, 2, 3, 4, 5],
      workingHours: '8:00 AM - 4:00 PM'
    },
    {
      id: 'bamenda-office',
      name: 'MINDEF Northwest Regional Office',
      address: 'Commercial Avenue, Bamenda',
      district: 'Bamenda',
      availableDays: [2, 4], // Tuesday and Thursday only
      workingHours: '9:00 AM - 3:00 PM'
    },
    {
      id: 'bafoussam-office',
      name: 'MINDEF West Regional Office',
      address: 'Route de Douala, Bafoussam',
      district: 'Bafoussam',
      availableDays: [1, 3, 5], // Monday, Wednesday, Friday
      workingHours: '8:30 AM - 3:30 PM'
    }
  ];

  const timeSlots: TimeSlot[] = [
    { id: 'slot-1', time: '8:00 AM', available: true, capacity: 20, booked: 12 },
    { id: 'slot-2', time: '9:00 AM', available: true, capacity: 20, booked: 18 },
    { id: 'slot-3', time: '10:00 AM', available: true, capacity: 20, booked: 8 },
    { id: 'slot-4', time: '11:00 AM', available: true, capacity: 20, booked: 15 },
    { id: 'slot-5', time: '1:00 PM', available: true, capacity: 20, booked: 10 },
    { id: 'slot-6', time: '2:00 PM', available: true, capacity: 20, booked: 20 },
    { id: 'slot-7', time: '3:00 PM', available: true, capacity: 20, booked: 5 },
  ];

  const getAvailableSlots = () => {
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    if (!selectedLoc || !selectedDate) return [];

    // Filter slots based on location working hours
    return timeSlots.filter(slot => {
      const slotHour = parseInt(slot.time);
      const isAfternoon = slot.time.includes('PM') && !slot.time.includes('12:');
      const hour24 = isAfternoon ? slotHour + 12 : slotHour;
      
      // Check if slot is within working hours
      if (selectedLoc.id === 'bamenda-office') {
        return hour24 >= 9 && hour24 <= 15;
      } else if (selectedLoc.id === 'bafoussam-office') {
        return hour24 >= 8 && hour24 <= 15;
      } else {
        return hour24 >= 8 && hour24 <= 16;
      }
    }).map(slot => ({
      ...slot,
      available: slot.booked < slot.capacity
    }));
  };

  const isDateAvailable = (date: Date) => {
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    if (!selectedLoc) return false;
    
    const dayOfWeek = date.getDay();
    const today = new Date();
    const isAfterToday = date > today;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    return isAfterToday && !isWeekend && selectedLoc.availableDays.includes(dayOfWeek);
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
  };

  const proceedToDateTime = () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }
    setBookingStep('datetime');
  };

  const proceedToConfirmation = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select both date and time');
      return;
    }
    setBookingStep('confirmation');
  };

  const confirmBooking = async () => {
    setIsBooking(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      setBookingStep('success');
      toast.success('Appointment booked successfully!');
    }, 2000);
  };

  const renderLocationSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Location</h2>
        <p className="text-muted-foreground">
          Select the MINDEF office where you'd like to complete your biometric data collection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((location) => (
          <Card
            key={location.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-medium border-2 ${
              selectedLocation === location.id
                ? 'ring-2 ring-primary ring-offset-2 shadow-medium border-primary'
                : 'hover:-translate-y-1'
            }`}
            onClick={() => handleLocationSelect(location.id)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{location.name}</h3>
                  <p className="text-muted-foreground text-sm">{location.address}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {location.workingHours}
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {location.availableDays.length === 5 ? 'Monday - Friday' : 
                     location.availableDays.length === 2 ? 'Tuesday & Thursday' :
                     'Monday, Wednesday, Friday'}
                  </div>
                </div>

                <Badge variant="outline" className="w-fit">
                  {location.district}
                </Badge>

                {selectedLocation === location.id && (
                  <div className="flex items-center text-primary text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Selected Location
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">What to Bring</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Original documents you uploaded (for verification)</li>
              <li>• This appointment confirmation (digital or printed)</li>
              <li>• Valid form of identification</li>
              <li>• Arrive 15 minutes before your scheduled time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDateTimeSelection = () => {
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    const availableSlots = getAvailableSlots();

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
          <p className="text-muted-foreground">
            Choose your preferred appointment date and time slot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-md border"
              />
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Available days: {selectedLoc?.availableDays.map(day => 
                  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                ).join(', ')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              {selectedDate && (
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please select a date first</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className="h-auto p-3 flex flex-col items-center"
                    >
                      <span className="font-medium">{slot.time}</span>
                      <div className="flex items-center text-xs mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        {slot.capacity - slot.booked} spots left
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm Appointment</h2>
          <p className="text-muted-foreground">
            Please review your appointment details before confirming
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Location</h4>
                  <p className="font-semibold">{selectedLoc?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedLoc?.address}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Date</h4>
                  <p className="font-semibold">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Time</h4>
                  <p className="font-semibold">{selectedSlot?.time}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Application ID</h4>
                  <p className="font-mono text-sm">{applicationId}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Important Reminders</h4>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• Arrive 15 minutes before your scheduled time</li>
                    <li>• Bring all original documents for verification</li>
                    <li>• Biometric data collection takes approximately 10-15 minutes</li>
                    <li>• Late arrivals may need to reschedule</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSuccess = () => {
    const selectedLoc = locations.find(loc => loc.id === selectedLocation);
    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Appointment Confirmed!</h2>
          <p className="text-muted-foreground">
            Your biometric appointment has been successfully booked. You'll receive a confirmation SMS shortly.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Appointment Confirmation
              <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Confirmation #:</span>
                <p className="font-mono font-medium">APT-{Date.now()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Application ID:</span>
                <p className="font-mono font-medium">{applicationId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">
                  {selectedDate?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <p className="font-medium">{selectedSlot?.time}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <span className="text-muted-foreground text-sm">Location:</span>
              <p className="font-medium">{selectedLoc?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedLoc?.address}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Download Confirmation
          </Button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (bookingStep) {
      case 'location':
        return renderLocationSelection();
      case 'datetime':
        return renderDateTimeSelection();
      case 'confirmation':
        return renderConfirmation();
      case 'success':
        return renderSuccess();
      default:
        return renderLocationSelection();
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
              disabled={isBooking}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payment
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                4
              </div>
              <span className="text-sm font-medium">Book Appointment</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-medium">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          {bookingStep !== 'success' && (
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (bookingStep === 'datetime') {
                    setBookingStep('location');
                  } else if (bookingStep === 'confirmation') {
                    setBookingStep('datetime');
                  } else {
                    onBack();
                  }
                }}
                disabled={isBooking}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {bookingStep === 'location' ? 'Back' : 'Previous'}
              </Button>
              
              <Button 
                onClick={() => {
                  if (bookingStep === 'location') {
                    proceedToDateTime();
                  } else if (bookingStep === 'datetime') {
                    proceedToConfirmation();
                  } else if (bookingStep === 'confirmation') {
                    confirmBooking();
                  }
                }}
                disabled={
                  isBooking ||
                  (bookingStep === 'location' && !selectedLocation) ||
                  (bookingStep === 'datetime' && (!selectedDate || !selectedTimeSlot))
                }
              >
                {isBooking ? 'Booking...' : 
                 bookingStep === 'confirmation' ? 'Confirm Appointment' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {bookingStep === 'success' && (
            <div className="flex justify-center mt-8">
              <Button size="lg" onClick={onComplete} className="px-8">
                Complete Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};