
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.EMPLOYEE:
        return 'Empregado';
      case UserRole.EMPLOYER:
        return 'Patrão';
      case UserRole.STUDENT:
        return 'Estudante';
      default:
        return '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/a_stylized_graphic_d-removebg-preview.png" 
            alt="ChronosFlow Logo" 
            className="w-24 h-24 object-contain"
          />
          <span className="text-xl font-bold" style={{ color: '#1E759B' }}>
            ChronosFlow
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Solo mostrar navegación si el usuario tiene múltiples roles disponibles */}
          {user.availableRoles && user.availableRoles.length > 1 ? (
            <nav className="flex bg-slate-100 p-1 rounded-xl">
              {user.availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentRole === role
                      ? 'bg-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  style={currentRole === role ? { color: '#1E759B' } : {}}
                >
                  {getRoleLabel(role)}
                </button>
              ))}
            </nav>
          ) : (
            <div className="px-4 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#1E759B20', color: '#1E759B' }}>
              {getRoleLabel(currentRole)}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#1E759B' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden md:block">
                {user.name}
              </span>
              <svg 
                className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-medium" style={{ color: '#1E759B' }}>
                        Rol actual: {getRoleLabel(user.role)}
                      </span>
                      {user.availableRoles && user.availableRoles.length > 1 && (
                        <span className="text-xs text-slate-400">
                          ({user.availableRoles.length} roles disponibles)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
