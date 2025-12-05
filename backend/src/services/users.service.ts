import { pool } from '../db/pool';
import { NewUser, UpdateUser, User } from '../models/user.model';

export async function listUsers(): Promise<User[]> {
  const result = await pool.query<User>('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
}

export async function getUser(id: number): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function createUser(data: NewUser): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [data.name, data.email, data.password_hash, data.role],
  );
  return result.rows[0];
}

export async function updateUser(id: number, updates: UpdateUser): Promise<User | null> {
  const fields = [] as string[];
  const values = [] as any[];
  let index = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index += 1;
    }
  });

  if (!fields.length) return getUser(id);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
  values.push(id);
  const result = await pool.query<User>(query, values);
  return result.rows[0] || null;
}

export async function deleteUser(id: number): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}
