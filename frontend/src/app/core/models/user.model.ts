export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
  meta: Record<string, unknown>;
  errors: string[];
}

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  errors: string[];
}
