/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
} from "axios";
import { toast } from "react-toastify";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface ApiResponse<T> extends AxiosResponse {
  data: T;
  message?: string;
}

interface AxiosUtility {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
    disabledSuccessToast?: boolean,
    disabledErrorToast?: boolean
  ) => Promise<ApiResponse<T>>;
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    disabledSuccessToast?: boolean,
    disabledErrorToast?: boolean
  ) => Promise<ApiResponse<T>>;
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    disabledSuccessToast?: boolean,
    disabledErrorToast?: boolean
  ) => Promise<ApiResponse<T>>;
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    disabledSuccessToast?: boolean,
    disabledErrorToast?: boolean
  ) => Promise<ApiResponse<T>>;
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
    disabledSuccessToast?: boolean,
    disabledErrorToast?: boolean
  ) => Promise<ApiResponse<T>>;
}

const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_SERVER_API_URL + "/api/"
    : "/api/";
const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleError = (error: unknown, disabledErrorToast = false): never => {
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
  if (!disabledErrorToast) {
    toast(message, { type: "error" });
  }

  // Rethrow the error if further handling is needed
  throw error;
};

const request = async <T>(
  method: HttpMethod,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  disabledSuccessToast = false,
  disabledErrorToast = false
): Promise<ApiResponse<T>> => {
  try {
    let response: AxiosResponse<ApiResponse<T>>;
    switch (method) {
      case "get":
        response = await api.get<ApiResponse<T>>(url, config);
        break;
      case "post":
        response = await api.post<ApiResponse<T>>(url, data, config);
        if (response?.data?.message && !disabledSuccessToast) {
          toast(response.data.message, { type: "success" });
        }
        break;
      case "put":
        response = await api.put<ApiResponse<T>>(url, data, config);
        if (response?.data?.message && !disabledSuccessToast) {
          toast(response.data.message, { type: "success" });
        }
        break;
      case "patch":
        response = await api.patch<ApiResponse<T>>(url, data, config);
        if (response?.data?.message && !disabledSuccessToast) {
          toast(response.data.message, { type: "success" });
        }
        break;
      case "delete":
        response = await api.delete<ApiResponse<T>>(url, config);
        if (response?.data?.message && !disabledSuccessToast) {
          toast(response.data.message, { type: "success" });
        }
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    return response.data;
  } catch (error) {
    handleError(error, disabledErrorToast);
  }
};

const axiosUtility: AxiosUtility = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
    disabledSuccessToast = false,
    disabledErrorToast = false
  ) =>
    request<T>(
      "get",
      url,
      undefined,
      config,
      disabledSuccessToast,
      disabledErrorToast
    ),
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    disabledSuccessToast = false,
    disabledErrorToast = false
  ) =>
    request<T>(
      "post",
      url,
      data,
      config,
      disabledSuccessToast,
      disabledErrorToast
    ),
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    disabledSuccessToast = false,
    disabledErrorToast = false
  ) =>
    request<T>(
      "put",
      url,
      data,
      config,
      disabledSuccessToast,
      disabledErrorToast
    ),
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    disabledSuccessToast = false,
    disabledErrorToast = false
  ) =>
    request<T>(
      "patch",
      url,
      data,
      config,
      disabledSuccessToast,
      disabledErrorToast
    ),
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
    disabledSuccessToast = false,
    disabledErrorToast = false
  ) =>
    request<T>(
      "delete",
      url,
      undefined,
      config,
      disabledSuccessToast,
      disabledErrorToast
    ),
};

export default axiosUtility;
