import React from 'react';

import { Shield, Award } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-soft border-b border-border/50">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MINDEF ID-CARD</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Ministry of Defense • République du Cameroun
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">System Status</div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Operational
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};