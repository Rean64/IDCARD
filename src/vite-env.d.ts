/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_FILE_TYPES: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'test';
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_CSP_ENABLED: string;
  readonly VITE_SECURE_COOKIES: string;
  readonly VITE_ORGANIZATION_NAME: string;
  readonly VITE_ORGANIZATION_CODE: string;
  readonly VITE_COUNTRY: string;
  readonly VITE_SUPPORT_EMAIL: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ENABLE_REGISTRATION: string;
  readonly VITE_ENABLE_DOCUMENT_UPLOAD: string;
  readonly VITE_ENABLE_EMAIL_NOTIFICATIONS: string;
  readonly VITE_ENABLE_SMS_NOTIFICATIONS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}