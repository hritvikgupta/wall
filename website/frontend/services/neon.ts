import { Pool } from '@neondatabase/serverless';

// In a real app, this should be an env var, but for this protoype we put it here as requested
const CONNECTION_STRING = "postgresql://neondb_owner:npg_Ovz8neGlK5uo@ep-winter-star-ah1ntun6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString: CONNECTION_STRING });

export interface Session {
    id: string;
    created_at: string;
    title: string;
    user_id: string;
}

export interface Message {
    id: string;
    session_id: string;
    created_at: string;
    role: 'user' | 'assistant';
    content: string;
    type: 'text' | 'code' | 'mixed';
}

export const neonService = {
    async getSessions(userId: string): Promise<Session[]> {
        try {
            const result = await pool.query(
                'SELECT * FROM ask_ai_sessions WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );
            return result.rows;
        } catch (e) {
            console.error("Error fetching sessions:", e);
            return [];
        }
    },

    async getMessages(sessionId: string): Promise<Message[]> {
        try {
            const result = await pool.query(
                'SELECT * FROM ask_ai_messages WHERE session_id = $1 ORDER BY created_at ASC',
                [sessionId]
            );
            return result.rows;
        } catch (e) {
            console.error("Error fetching messages:", e);
            return [];
        }
    },

    async createUser(name: string, org: string, email: string, pass: string): Promise<{ id: string; name: string; org: string; email: string } | null> {
        try {
            const id = crypto.randomUUID();
            const result = await pool.query(
                'INSERT INTO ask_ai_users (id, name, org, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, org, email',
                [id, name, org, email, pass]
            );
            return result.rows[0];
        } catch (e) {
            console.error("Error creating user:", e);
            return null;
        }
    },

    async loginUser(email: string, pass: string): Promise<{ id: string; name: string; org: string; email: string } | null> {
        try {
            const result = await pool.query(
                'SELECT id, name, org, email FROM ask_ai_users WHERE email = $1 AND password = $2',
                [email, pass]
            );
            return result.rows[0] || null;
        } catch (e) {
            console.error("Error logging in:", e);
            return null;
        }
    },

    async createSession(userId: string, title: string): Promise<Session | null> {
        try {
            const result = await pool.query(
                'INSERT INTO ask_ai_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
                [userId, title]
            );
            return result.rows[0];
        } catch (e) {
            console.error("Error creating session:", e);
            return null;
        }
    },

    async addMessage(sessionId: string, role: string, content: string, type: string = 'text'): Promise<Message | null> {
        try {
            const result = await pool.query(
                'INSERT INTO ask_ai_messages (session_id, role, content, type) VALUES ($1, $2, $3, $4) RETURNING *',
                [sessionId, role, content, type]
            );
            return result.rows[0];
        } catch (e) {
            console.error("Error adding message:", e);
            return null;
        }
    }
};
