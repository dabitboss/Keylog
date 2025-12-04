import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { pool } from '../db/pool';
import { AuthTokenPayload } from '../models/auth.model';
import { NewUser, User } from '../models/user.model';

async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
}

async function insertUser(data: NewUser): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [data.name, data.email, data.password_hash, data.role],
  );
  return result.rows[0];
}

function signTokens(user: User) {
  const payload: AuthTokenPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
}

export async function register(name: string, email: string, password: string, role: string) {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('El correo ya está registrado');

  const password_hash = await bcrypt.hash(password, 10);
  const user = await insertUser({ name, email, password_hash, role });
  const tokens = signTokens(user);
  return { user, tokens };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Credenciales inválidas');

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new Error('Credenciales inválidas');

  const tokens = signTokens(user);
  return { user, tokens };
}

export function refresh(user: User) {
  return signTokens(user);
}
