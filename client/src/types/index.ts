export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  role: string; // Теперь required
}

export interface AuthResponse {
  token: string;
  username?: string;
  error?: string;
}

export interface UsersResponse {
  count: number;
  rows: User[];
}
