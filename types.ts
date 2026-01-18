
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  EMPLOYER = 'EMPLOYER',
  STUDENT = 'STUDENT'
}

export interface TimeLog {
  id: string;
  date: string;
  hours: number;
}

export interface Employee {
  id: string;
  name: string;
  logs: TimeLog[];
}

export interface StudentGoal {
  totalHours: number;
  months: number;
  startDate: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Rol actual seleccionado
  availableRoles: UserRole[]; // Roles disponibles que el usuario puede usar
  authProvider: 'email' | 'google';
  password?: string; // Solo para sistema de prueba con localStorage
}

export interface AppState {
  user: User | null;
  role: UserRole;
  currentEmployeeId: string | null;
  employees: Employee[];
  studentGoal: StudentGoal | null;
}
