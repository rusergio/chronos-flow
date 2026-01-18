
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Employee, TimeLog, User } from './types';
import Header from './components/Header';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import StudentCalculator from './components/StudentCalculator';
import AIScheduler from './components/AIScheduler';
import AuthForm from './components/AuthForm';

const STORAGE_KEY = 'chronos_flow_data';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        user: parsed.user || null,
      };
    }
    return {
      user: null,
      role: UserRole.EMPLOYEE,
      currentEmployeeId: null,
      employees: [],
      studentGoal: null,
    };
  });

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        // Asegurar que availableRoles exista (compatibilidad con usuarios antiguos)
        if (!userInfo.availableRoles) {
          userInfo.availableRoles = [userInfo.role];
        }
        setUser(userInfo);
        setState(prev => ({
          ...prev,
          user: userInfo,
          role: userInfo.role,
        }));
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, user]);

  const setRole = (role: UserRole) => {
    if (user) {
      // Validar que el rol esté en los roles disponibles del usuario
      const availableRoles = user.availableRoles || [user.role];
      if (!availableRoles.includes(role)) {
        console.warn('El usuario no tiene acceso a este rol');
        return;
      }

      setState(prev => ({ ...prev, role }));
      // Actualizar el rol del usuario en localStorage
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      
      // Actualizar en el array de usuarios
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    // Asegurar que availableRoles exista
    const userWithRoles = {
      ...authenticatedUser,
      availableRoles: authenticatedUser.availableRoles || [authenticatedUser.role]
    };
    
    setUser(userWithRoles);
    
    // Actualizar también en el array de usuarios
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === authenticatedUser.id);
    if (userIndex >= 0) {
      users[userIndex] = userWithRoles;
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('current_user', JSON.stringify(userWithRoles));
    setState(prev => ({
      ...prev,
      user: userWithRoles,
      role: authenticatedUser.role,
    }));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setState(prev => ({
      ...prev,
      user: null,
    }));
  };

  const addEmployee = (name: string) => {
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      name,
      logs: [],
    };
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
      currentEmployeeId: prev.currentEmployeeId || newEmployee.id
    }));
  };

  const removeEmployee = (id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id),
      currentEmployeeId: prev.currentEmployeeId === id ? null : prev.currentEmployeeId
    }));
  };

  const logHours = (employeeId: string, date: string, hours: number) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(emp => {
        if (emp.id !== employeeId) return emp;
        const existingLogIndex = emp.logs.findIndex(l => l.date === date);
        const newLogs = [...emp.logs];
        if (existingLogIndex >= 0) {
          newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], hours };
        } else {
          newLogs.push({ id: crypto.randomUUID(), date, hours });
        }
        return { ...emp, logs: newLogs };
      })
    }));
  };

  const removeHours = (employeeId: string, date: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.map(emp => {
        if (emp.id !== employeeId) return emp;
        const filteredLogs = emp.logs.filter(l => l.date !== date);
        return { ...emp, logs: filteredLogs };
      })
    }));
  };

  const renderView = () => {
    if (!user) {
      return <AuthForm onAuthSuccess={handleAuthSuccess} />;
    }

    switch (state.role) {
      case UserRole.EMPLOYEE:
        return (
          <EmployeeDashboard 
            employees={state.employees} 
            onAddEmployee={addEmployee}
            onLogHours={logHours}
            onRemoveHours={removeHours}
            currentEmployeeId={state.currentEmployeeId}
            onSetCurrentEmployee={(id) => setState(prev => ({ ...prev, currentEmployeeId: id }))}
            currentUser={user}
          />
        );
      case UserRole.EMPLOYER:
        return (
          <EmployerDashboard 
            employees={state.employees} 
            onAddEmployee={addEmployee}
            onRemoveEmployee={removeEmployee}
            onLogHours={logHours}
          />
        );
      case UserRole.STUDENT:
        return <StudentCalculator />;
      default:
        return null;
    }
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header 
        currentRole={state.role} 
        onRoleChange={setRole} 
        user={user}
        onLogout={handleLogout}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderView()}
      </main>
      
      {/* Optional AI Assistant floating bubble */}
      <div className="fixed bottom-6 right-6">
        <AIScheduler state={state} />
      </div>
    </div>
  );
};

export default App;
