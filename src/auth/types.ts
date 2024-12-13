export interface User {
  username: string;
  passwordHash: string;
  isAdmin: boolean;
}

export interface AuthCredentials {
  username: string;
  password: string;
} 