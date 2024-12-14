import bcrypt from 'bcryptjs';
export class AuthService {
    users = new Map();
    static async initialize() {
        const service = new AuthService();
        await service.initializeDefaultAdmin();
        return service;
    }
    constructor() {
        console.log('Initializing AuthService...');
    }
    async initializeDefaultAdmin() {
        await this.createUser({
            username: 'admin',
            password: 'admin123'
        }, true);
        console.log('Default admin user created');
    }
    async authenticate(credentials) {
        console.log(`🔑 Attempting authentication for user: ${credentials.username}`);
        const user = this.users.get(credentials.username);
        if (!user) {
            console.warn(`⚠️ User not found: ${credentials.username}`);
            return null;
        }
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        console.log(`🔐 Authentication ${isValid ? 'successful' : 'failed'} for user: ${credentials.username}`);
        return isValid ? user : null;
    }
    async createUser(credentials, isAdmin = false) {
        console.log(`👤 Creating new user: ${credentials.username} (Admin: ${isAdmin})`);
        const passwordHash = await bcrypt.hash(credentials.password, 10);
        const user = {
            username: credentials.username,
            passwordHash,
            isAdmin
        };
        this.users.set(credentials.username, user);
        console.log(`✅ User ${credentials.username} created successfully`);
        return user;
    }
}
