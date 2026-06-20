import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV = {
  dev: {
    apiUrl: "http://31.97.239.190:9001",
    fileBaseUrl: "https://admin.getmyhelp.in",
  },
  staging: {
    apiUrl: "http://31.97.239.190:9001",
    fileBaseUrl: "https://admin.getmyhelp.in",
  },
  prod: {
    apiUrl: "http://31.97.239.190:9001",
    fileBaseUrl: "https://admin.getmyhelp.in",
  },
};

const getEnvVars = () => {
  if (Constants.expoConfig?.extra?.environment === 'staging') return ENV.staging;
  return ENV.prod;
};

const config = getEnvVars();

// Resolve a media path returned by the API into an absolute URL.
// Root-relative paths ("/documents/...") are prefixed with the file host;
// absolute URLs (http/https) are passed through unchanged.
export const mediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${config.fileBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default config;
