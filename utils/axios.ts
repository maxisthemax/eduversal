/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from "axios";
import { toast } from "react-toastify";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface AxiosUtility {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
}

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const handleError = (error: unknown): never => {
  let message = "An unexpected error occurred";

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Server responded with a status other than 2xx
      const status = axiosError.response.status;
      const response = axiosError?.response?.data as { message: string };

      if (response && response?.message) {
        message = response?.message;
      } else {
        switch (status) {
          case 400:
            message = "Bad Request";
            break;
          case 401:
            message = "Unauthorized. Please log in.";
            break;
          case 403:
            message = "Forbidden. You do not have access.";
            break;
          case 404:
            message = "Resource not found.";
            break;
          case 500:
            message = "Internal Server Error.";
            break;
          default:
            message = `Error: ${status}`;
        }
      }
    } else if (axiosError.request) {
      // Request was made but no response received
      message = "No response from server";
    } else if (axiosError.message) {
      // Something happened in setting up the request
      message = axiosError.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Display the error message using toast
  toast(message, { type: "error" });

  // Rethrow the error if further handling is needed
  throw error;
};

const request = async <T>(
  method: HttpMethod,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    switch (method) {
      case "get":
        return await api.get<T>(url, config);
      case "post":
        return await api.post<T>(url, data, config);
      case "put":
        return await api.put<T>(url, data, config);
      case "patch":
        return await api.patch<T>(url, data, config);
      case "delete":
        return await api.delete<T>(url, config);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    handleError(error);
  }
};

const axiosUtility: AxiosUtility = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request<T>("get", url, undefined, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("post", url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("put", url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>("patch", url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request<T>("delete", url, undefined, config),
};

export default axiosUtility;
