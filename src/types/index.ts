export type BaseApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiResponse<T> = BaseApiResponse<T>;
