// Environment configuration for MINDEF ID-CARD System

interface EnvironmentConfig {
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  JWT_SECRET: string;
  SESSION_TIMEOUT: number;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  APP_ENV: 'development' | 'production' | 'test';
  DEBUG_MODE: boolean;
  ENABLE_ANALYTICS: boolean;
  CSP_ENABLED: boolean;
  SECURE_COOKIES: boolean;
  ORGANIZATION_NAME: string;
  ORGANIZATION_CODE: string;
  COUNTRY: string;
  SUPPORT_EMAIL: string;
  ADMIN_EMAIL: string;
  ENABLE_REGISTRATION: boolean;
  ENABLE_DOCUMENT_UPLOAD: boolean;
  ENABLE_EMAIL_NOTIFICATIONS: boolean;
  ENABLE_SMS_NOTIFICATIONS: boolean;
}

// Safe environment variable access with proper error handling
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    // Safely access import.meta.env with null checking
    const env = import.meta?.env;
    if (env && typeof env === 'object' && key in env) {
      return env[key] || defaultValue;
    }
  } catch (error) {
    // Silent fallback - don't log in production
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.warn(`Environment variable ${key} not available, using default: ${defaultValue}`);
    }
  }
  return defaultValue;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key, defaultValue.toString()).toLowerCase();
  return value === 'true' || value === '1';
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, defaultValue.toString());
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getArrayEnvVar = (key: string, defaultValue: string[] = []): string[] => {
  const value = getEnvVar(key, defaultValue.join(','));
  return value ? value.split(',').map(item => item.trim()) : defaultValue;
};

// Configuration object with safe defaults
export const config: EnvironmentConfig = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  APP_NAME: getEnvVar('VITE_APP_NAME', 'MINDEF ID-CARD System'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  JWT_SECRET: getEnvVar('VITE_JWT_SECRET', 'mindef_secure_jwt_key_2024'),
  SESSION_TIMEOUT: getNumberEnvVar('VITE_SESSION_TIMEOUT', 3600000),
  MAX_FILE_SIZE: getNumberEnvVar('VITE_MAX_FILE_SIZE', 5242880),
  ALLOWED_FILE_TYPES: getArrayEnvVar('VITE_ALLOWED_FILE_TYPES', ['image/jpeg', 'image/png', 'application/pdf']),
  APP_ENV: (getEnvVar('VITE_APP_ENV', 'development') as 'development' | 'production' | 'test'),
  DEBUG_MODE: getBooleanEnvVar('VITE_DEBUG_MODE', true),
  ENABLE_ANALYTICS: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  CSP_ENABLED: getBooleanEnvVar('VITE_CSP_ENABLED', true),
  SECURE_COOKIES: getBooleanEnvVar('VITE_SECURE_COOKIES', true),
  ORGANIZATION_NAME: getEnvVar('VITE_ORGANIZATION_NAME', 'Ministry of Defense'),
  ORGANIZATION_CODE: getEnvVar('VITE_ORGANIZATION_CODE', 'MINDEF'),
  COUNTRY: getEnvVar('VITE_COUNTRY', 'Cameroon'),
  SUPPORT_EMAIL: getEnvVar('VITE_SUPPORT_EMAIL', 'support@mindef.gov.cm'),
  ADMIN_EMAIL: getEnvVar('VITE_ADMIN_EMAIL', 'admin@mindef.gov.cm'),
  ENABLE_REGISTRATION: getBooleanEnvVar('VITE_ENABLE_REGISTRATION', true),
  ENABLE_DOCUMENT_UPLOAD: getBooleanEnvVar('VITE_ENABLE_DOCUMENT_UPLOAD', true),
  ENABLE_EMAIL_NOTIFICATIONS: getBooleanEnvVar('VITE_ENABLE_EMAIL_NOTIFICATIONS', false),
  ENABLE_SMS_NOTIFICATIONS: getBooleanEnvVar('VITE_ENABLE_SMS_NOTIFICATIONS', false)
};

// Debug configuration in development (only in browser and localhost)
if (config.DEBUG_MODE && config.APP_ENV === 'development') {
  try {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🔧 MINDEF Environment Configuration:', {
        API_BASE_URL: config.API_BASE_URL,
        APP_NAME: config.APP_NAME,
        APP_VERSION: config.APP_VERSION,
        APP_ENV: config.APP_ENV,
        ORGANIZATION_NAME: config.ORGANIZATION_NAME,
        ENABLE_ANALYTICS: config.ENABLE_ANALYTICS
      });
    }
  } catch (error) {
    // Silent fail for debug logging
  }
}

export default config;