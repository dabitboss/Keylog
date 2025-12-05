import { pool } from '../db/pool';
import { NewRole, Role } from '../models/role.model';

export async function listRoles(): Promise<Role[]> {
  const result = await pool.query<Role>('SELECT id, name, permissions FROM roles ORDER BY id');
  return result.rows;
}

export async function createRole(data: NewRole): Promise<Role> {
  const result = await pool.query<Role>(
    `INSERT INTO roles (name, permissions) VALUES ($1, $2) RETURNING *`,
    [data.name, data.permissions],
  );
  return result.rows[0];
}
