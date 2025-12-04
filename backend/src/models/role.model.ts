export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export type NewRole = Omit<Role, 'id'>;
