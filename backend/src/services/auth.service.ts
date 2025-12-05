import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { pool } from '../db/pool';
import { AuthTokenPayload } from '../models/auth.model';
import { NewUser, User } from '../models/user.model';

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function toPublicUser(user: User) {
  const { password_hash, ...safe } = user;
  return safe;
}

async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
}

async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
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
  if (!name || !email || !password) {
    throw new HttpError(400, 'Nombre, correo y contraseña son obligatorios');
  }

  const existing = await findUserByEmail(email);
  if (existing) throw new HttpError(400, 'El correo ya está registrado');

  const password_hash = await bcrypt.hash(password, 10);
  const user = await insertUser({ name, email, password_hash, role });
  const tokens = signTokens(user);
  return { user: toPublicUser(user), tokens };
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new HttpError(400, 'Correo y contraseña son obligatorios');
  }

  const user = await findUserByEmail(email);
  if (!user) throw new HttpError(401, 'Credenciales inválidas');

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new HttpError(401, 'Credenciales inválidas');

  const tokens = signTokens(user);
  return { user: toPublicUser(user), tokens };
}

export async function refresh(refreshToken: string) {
  if (!refreshToken) {
    throw new HttpError(400, 'Refresh token requerido');
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as { sub: number };
    const user = await findUserById(decoded.sub);
    if (!user) {
      throw new HttpError(404, 'Usuario no encontrado');
    }
    const tokens = signTokens(user);
    return { user: toPublicUser(user), tokens };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(401, 'Refresh token inválido');
  }
}

export { HttpError };
