import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Application {
  id: string;
  applicationId: string;
  userId?: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    nationality: string;
    gender: string;
    maritalStatus: string;
    profession: string;
    address: string;
    phoneNumber: string;
    email: string;
  };
  documents: {
    photo?: string;
    birthCertificate?: string;
    proofOfAddress?: string;
    passport?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  applications: Application[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateApplication: (application: Application) => void;
  createApplication: (applicationData: any) => Promise<string>;
  getApplicationById: (id: string) => Application | undefined;
  getUserApplications: (userId: string) => Application[];
  getAllApplications: () => Application[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('auth_token');
        if (token) {
          apiService.setToken(token);
          const response = await apiService.getCurrentUser();
          if (response.data) {
            setUser(response.data.user);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
            apiService.setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clean up on error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        apiService.setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      if (response.data) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    try {
      const response = await apiService.register(userData);
      if (response.data) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.setToken(null);
  };

  const updateApplication = (application: Application) => {
    setApplications(prev => 
      prev.map(app => app.id === application.id ? application : app)
    );
  };

  const createApplication = async (applicationData: any): Promise<string> => {
    try {
      const response = await apiService.createApplication(applicationData);
      if (response.data) {
        const newApp = response.data.application;
        setApplications(prev => [...prev, newApp]);
        return newApp.applicationId;
      }
      throw new Error('Failed to create application');
    } catch (error) {
      console.error('Create application error:', error);
      throw error;
    }
  };

  const getApplicationById = (id: string): Application | undefined => {
    return applications.find(app => app.id === id || app.applicationId === id);
  };

  const getUserApplications = (userId: string): Application[] => {
    return applications.filter(app => app.userId === userId);
  };

  const getAllApplications = (): Application[] => {
    return applications;
  };

  const value: AuthContextType = {
    user,
    applications,
    login,
    register,
    logout,
    updateApplication,
    createApplication,
    getApplicationById,
    getUserApplications,
    getAllApplications,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};