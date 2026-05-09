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

export default getEnvVars();
