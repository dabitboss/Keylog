export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  created_at: Date;
}

export type NewUser = Pick<User, 'name' | 'email' | 'password_hash' | 'role'>;
export type UpdateUser = Partial<Pick<User, 'name' | 'email' | 'role' | 'is_active'>>;
