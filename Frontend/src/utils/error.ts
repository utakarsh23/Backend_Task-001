export interface AxiosError {
  response?: {
    data?: {
      message?: string;
      warning?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

export const getErrorMessage = (error: unknown): string => {
  const err = error as AxiosError;
  return err.response?.data?.message || 
         err.response?.data?.warning || 
         err.response?.data?.error || 
         err.message || 
         'An unexpected error occurred';
};