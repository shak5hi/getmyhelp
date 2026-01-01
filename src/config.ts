import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV = {
  dev: {
    // Use staging URL for development too, or use local if you have backend running locally
    apiUrl: "http://31.97.239.190:9001",
    // Uncomment if testing with local backend:
    // apiUrl: Platform.OS === 'android' ? "http://10.0.2.2:9001" : "http://localhost:9001",
  },
  staging: {
    apiUrl: "http://31.97.239.190:9001",
  },
  prod: {
    apiUrl: "http://31.97.239.190:9001", // Update this when you have production URL
  },
};

const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  if (Constants.expoConfig?.extra?.environment === 'staging') return ENV.staging;
  return ENV.prod;
};

export default getEnvVars();