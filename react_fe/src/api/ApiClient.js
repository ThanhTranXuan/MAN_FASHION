import axios from 'axios';
import qs from 'qs';
import AuthService from 'services/AuthService';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


const paramsSerializer = (params) =>
  qs.stringify(params, { arrayFormat: 'repeat' });



const ApiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  paramsSerializer,
});




export const uploadClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  paramsSerializer,
});




const attachToken = (config) => {
  const token = AuthService.getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete config.headers['Authorization'];
  }
  return config;
};

ApiClient.interceptors.request.use(attachToken);
uploadClient.interceptors.request.use(attachToken);




let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const shouldRefresh = (error) => {
  const status = error.response?.status;
  return (status === 401 || status === 403) && !error.config._retry;
};

const createResponseInterceptor = (client) =>
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;


      if (!shouldRefresh(error)) {
        return Promise.reject(error);
      }


      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(client(originalRequest));
            },
            reject,
          });
        });
      }


      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const newToken = await AuthService.refreshToken();


        AuthService.setAccessToken(newToken);


        ApiClient.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${newToken}`;
        uploadClient.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${newToken}`;


        processQueue(null, newToken);
        isRefreshing = false;


        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (err) {

        processQueue(err, null);
        isRefreshing = false;
        console.error('❌ Refresh token failed:', err);


        AuthService.logout();

        return Promise.reject(err);
      }
    },
  );


createResponseInterceptor(ApiClient);
createResponseInterceptor(uploadClient);

export default ApiClient;
