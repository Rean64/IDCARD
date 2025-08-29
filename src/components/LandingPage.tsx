import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Shield, 
  FileCheck, 
  ArrowRight, 
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  Search,
  UserX,
  UserPlus
} from 'lucide-react';

interface LandingPageProps {
  onStartApplication: () => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApplication, onAdminLogin }) => {
  const services = [
    {
      icon: <UserPlus className="h-8 w-8 text-blue-600" />,
      title: "First ID Card",
      description: "Apply for your first national ID card",
      color: "from-blue-50 to-blue-100"
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-green-600" />,
      title: "Renewal",
      description: "Renew your existing ID card",
      color: "from-green-50 to-green-100"
    },
    {
      icon: <UserX className="h-8 w-8 text-red-600" />,
      title: "Lost/Stolen Card",
      description: "Replace your lost or stolen ID card",
      color: "from-red-50 to-red-100"
    },
    {
      icon: <Search className="h-8 w-8 text-purple-600" />,
      title: "Damaged Card",
      description: "Replace your damaged ID card",
      color: "from-purple-50 to-purple-100"
    }
  ];

  const features = [
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "Digital Forms",
      description: "Fill forms online with smart validation"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Online Payment",
      description: "Pay securely with multiple payment methods"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Appointment",
      description: "Schedule biometric data collection"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Download Forms",
      description: "Get your application documents instantly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MINDEF ID-CARD</h1>
                <p className="text-sm text-muted-foreground">Ministry of Defense Identity System</p>
              </div>
            </div>
            <Button variant="outline" onClick={onAdminLogin} className="border-2">
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            🇨🇲 République du Cameroun - Official Portal
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Apply for Your
            <br />
            <span className="text-gradient">National ID Card</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and convenient online application process for Cameroon national identity cards.
            Complete your application in minutes.
          </p>
          <Button 
            size="lg" 
            onClick={onStartApplication}
            className="text-lg px-8 py-6 shadow-medium hover:shadow-strong"
          >
            Start Application
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6 bg-slate-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Service</h2>
            <p className="text-muted-foreground text-lg">Select the type of ID card service you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-medium hover:shadow-strong cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${service.color}`}
                onClick={onStartApplication}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Digital Platform?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the fastest and most secure way to apply for your national ID card
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-6 bg-slate-50/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple 5-Step Process</h2>
            <p className="text-muted-foreground text-lg">Get your ID card in just a few easy steps</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { step: "1", title: "Choose Service", desc: "Select your ID card type" },
                { step: "2", title: "Fill Forms", desc: "Complete the application form" },
                { step: "3", title: "Make Payment", desc: "Pay securely online" },
                { step: "4", title: "Book Appointment", desc: "Schedule biometric collection" },
                { step: "5", title: "Collect Card", desc: "Receive your new ID card" }
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-medium">
                    {item.step}
                  </div>
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  {index < 4 && (
                    <ArrowRight className="hidden md:block absolute top-6 -right-4 h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 gradient-primary text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of Cameroonians who have successfully obtained their ID cards through our digital platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onStartApplication}
            className="text-lg px-8 py-6 shadow-strong hover:shadow-strong"
          >
            Apply Now - It's Free to Start
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">MINDEF ID-CARD</h3>
                  <p className="text-sm">Ministry of Defense</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Official digital platform for Cameroon national identity card applications.
                Secure, fast, and reliable.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">New ID Card</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Renewal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Replacement</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Check</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Ministry of Defense - République du Cameroun. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};