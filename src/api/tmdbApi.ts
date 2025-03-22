import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_KEY, ACCESS_TOKEN } from './config';

const tmdbApi = axios.create({
  baseURL: API_BASE_URL,
  params: {
    api_key: API_KEY,
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
}) as AxiosInstance;

tmdbApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

tmdbApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {

      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default tmdbApi; 