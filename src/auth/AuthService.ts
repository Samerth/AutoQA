import bcrypt from 'bcryptjs';
import { User, AuthCredentials } from './types.js';

export class AuthService {
    private users: Map<string, User> = new Map();
  
    static async initialize(): Promise<AuthService> {
      const service = new AuthService();
      await service.initializeDefaultAdmin();
      return service;
    }
  
    private constructor() {
      console.log('Initializing AuthService...');
    }
  
    private async initializeDefaultAdmin() {
      await this.createUser({
        username: 'admin',
        password: 'admin123'
      }, true);
      console.log('Default admin user created');
    }
    

  async authenticate(credentials: AuthCredentials): Promise<User | null> {
    console.log(`Attempting authentication for user: ${credentials.username}`);
    const user = this.users.get(credentials.username);
    
    if (!user) {
      console.warn(`User not found: ${credentials.username}`);
      return null;
    }

    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    console.log(`Authentication ${isValid ? 'successful' : 'failed'} for user: ${credentials.username}`);
    return isValid ? user : null;
  }

  private async createUser(credentials: AuthCredentials, isAdmin: boolean = false): Promise<User> {
    console.log(`Creating new user: ${credentials.username} (Admin: ${isAdmin})`);
    const passwordHash = await bcrypt.hash(credentials.password, 10);
    const user: User = {
      username: credentials.username,
      passwordHash,
      isAdmin
    };
    
    this.users.set(credentials.username, user);
    console.log(`User ${credentials.username} created successfully`);
    return user;
  }
} 