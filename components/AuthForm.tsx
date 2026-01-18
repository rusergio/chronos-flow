import React, { useState, useMemo } from 'react';
import { UserRole, User } from '../types';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

type PasswordStrength = 'weak' | 'normal' | 'strong';

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Manejar selección de roles con validaciones
  const handleRoleToggle = (role: UserRole) => {
    setError('');
    const isSelected = selectedRoles.includes(role);
    const hasStudent = selectedRoles.includes(UserRole.STUDENT);

    if (isSelected) {
      // Deseleccionar
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      // Si selecciona STUDENT, no puede tener EMPLOYEE y EMPLOYER al mismo tiempo
      if (role === UserRole.STUDENT) {
        const hasEmployee = selectedRoles.includes(UserRole.EMPLOYEE);
        const hasEmployer = selectedRoles.includes(UserRole.EMPLOYER);
        
        if (hasEmployee && hasEmployer) {
          setError('No puedes seleccionar Empregado y Patrão al mismo tiempo. Debes elegir solo uno.');
          return;
        }
      }
      
      // Si ya tiene STUDENT y quiere seleccionar EMPLOYEE o EMPLOYER
      if (hasStudent && (role === UserRole.EMPLOYEE || role === UserRole.EMPLOYER)) {
        // Si ya tiene uno de los dos, no puede seleccionar el otro
        if (selectedRoles.includes(UserRole.EMPLOYEE) && role === UserRole.EMPLOYER) {
          setError('No puedes seleccionar Empregado y Patrão al mismo tiempo. Debes elegir solo uno.');
          return;
        }
        if (selectedRoles.includes(UserRole.EMPLOYER) && role === UserRole.EMPLOYEE) {
          setError('No puedes seleccionar Empregado y Patrão al mismo tiempo. Debes elegir solo uno.');
          return;
        }
      }
      
      // Si no tiene STUDENT y quiere seleccionar EMPLOYEE y EMPLOYER
      if (!hasStudent && role === UserRole.EMPLOYEE && selectedRoles.includes(UserRole.EMPLOYER)) {
        setError('No puedes seleccionar Empregado y Patrão al mismo tiempo. Selecciona Estudante si deseas combinar.');
        return;
      }
      if (!hasStudent && role === UserRole.EMPLOYER && selectedRoles.includes(UserRole.EMPLOYEE)) {
        setError('No puedes seleccionar Empregado y Patrão al mismo tiempo. Selecciona Estudante si deseas combinar.');
        return;
      }
      
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // Función para calcular la fortaleza de la contraseña
  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    if (pwd.length === 0) return 'weak';
    
    let strength = 0;
    
    // Longitud
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    
    // Diferentes tipos de caracteres
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'normal';
    return 'strong';
  };

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'normal':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
    }
  };

  const getStrengthLabel = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return 'Débil';
      case 'normal':
        return 'Normal';
      case 'strong':
        return 'Fuerte';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: User) => u.email === email);
        
        if (!user) {
          setError('Usuario no encontrado. Por favor, regístrate primero.');
          setLoading(false);
          return;
        }

        // En un sistema real, aquí verificarías el hash de la contraseña
        // Por ahora, solo verificamos que la contraseña coincida (sistema de prueba)
        if (user.password !== password) {
          setError('Contraseña incorrecta.');
          setLoading(false);
          return;
        }

        // Asegurar que el usuario tenga availableRoles (para compatibilidad con usuarios antiguos)
        const userWithRoles = {
          ...user,
          availableRoles: user.availableRoles || [user.role]
        };
        
        onAuthSuccess(userWithRoles);
      } else {
        // Registro
        if (!name.trim()) {
          setError('Por favor, ingrese su nombre');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        if (selectedRoles.length === 0) {
          setError('Por favor, selecciona al menos un rol');
          setLoading(false);
          return;
        }

        // Verificar si el usuario ya existe
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: User) => u.email === email);
        
        if (existingUser) {
          setError('Este email ya está registrado. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        // El primer rol seleccionado será el rol inicial
        const initialRole = selectedRoles[0];

        // Crear nuevo usuario con todos los roles disponibles
        const newUser: User = {
          id: crypto.randomUUID(),
          email: email,
          name: name,
          role: initialRole,
          availableRoles: selectedRoles,
          authProvider: 'email',
          password: password // En producción, esto debería ser un hash
        };

        // Guardar usuario
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        onAuthSuccess(newUser);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/a_stylized_graphic_d-removebg-preview.png" 
            alt="ChronosFlow Logo" 
            className="w-56 h-56 mx-auto mb-1 object-contain"
          />
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1E759B' }}>
            ChronosFlow
          </h1>
          <p className="text-slate-500">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isLogin && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Selecciona tu(s) categoría(s) *
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Puedes seleccionar múltiples opciones. Estudante permite combinar con Empregado O Patrão (solo uno).
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Empregado - Color Azul/Indigo */}
              <label className={`
                group relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                ${selectedRoles.includes(UserRole.EMPLOYEE)
                  ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-200/50'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                }
              `}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(UserRole.EMPLOYEE)}
                  onChange={() => handleRoleToggle(UserRole.EMPLOYEE)}
                  className="sr-only peer"
                />
                <div className={`
                  w-6 h-6 mb-3 rounded-lg border-2 flex items-center justify-center transition-all
                  ${selectedRoles.includes(UserRole.EMPLOYEE)
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300 bg-white group-hover:border-indigo-400'
                  }
                `}>
                  {selectedRoles.includes(UserRole.EMPLOYEE) && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`
                  text-sm font-semibold text-center transition-colors
                  ${selectedRoles.includes(UserRole.EMPLOYEE) ? 'text-indigo-700' : 'text-slate-600'}
                `}>
                  Empregado
                </span>
              </label>

              {/* Patrão - Color Verde/Emerald */}
              <label className={`
                group relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                ${selectedRoles.includes(UserRole.EMPLOYER)
                  ? 'border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-200/50'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                }
              `}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(UserRole.EMPLOYER)}
                  onChange={() => handleRoleToggle(UserRole.EMPLOYER)}
                  className="sr-only peer"
                />
                <div className={`
                  w-6 h-6 mb-3 rounded-lg border-2 flex items-center justify-center transition-all
                  ${selectedRoles.includes(UserRole.EMPLOYER)
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300 bg-white group-hover:border-emerald-400'
                  }
                `}>
                  {selectedRoles.includes(UserRole.EMPLOYER) && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`
                  text-sm font-semibold text-center transition-colors
                  ${selectedRoles.includes(UserRole.EMPLOYER) ? 'text-emerald-700' : 'text-slate-600'}
                `}>
                  Patrão
                </span>
              </label>

              {/* Estudante - Color Violeta/Purple */}
              <label className={`
                group relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                ${selectedRoles.includes(UserRole.STUDENT)
                  ? 'border-violet-600 bg-violet-50 shadow-md shadow-violet-200/50'
                  : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30'
                }
              `}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(UserRole.STUDENT)}
                  onChange={() => handleRoleToggle(UserRole.STUDENT)}
                  className="sr-only peer"
                />
                <div className={`
                  w-6 h-6 mb-3 rounded-lg border-2 flex items-center justify-center transition-all
                  ${selectedRoles.includes(UserRole.STUDENT)
                    ? 'border-violet-600 bg-violet-600'
                    : 'border-slate-300 bg-white group-hover:border-violet-400'
                  }
                `}>
                  {selectedRoles.includes(UserRole.STUDENT) && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`
                  text-sm font-semibold text-center transition-colors
                  ${selectedRoles.includes(UserRole.STUDENT) ? 'text-violet-700' : 'text-slate-600'}
                `}>
                  Estudante
                </span>
              </label>
            </div>
            {selectedRoles.length > 0 && (
              <p className="mt-3 text-xs text-indigo-600 font-medium text-center">
                Seleccionado(s): {selectedRoles.map(r => {
                  if (r === UserRole.EMPLOYEE) return 'Empregado';
                  if (r === UserRole.EMPLOYER) return 'Patrão';
                  return 'Estudante';
                }).join(', ')}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {!isLogin && password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">Fortaleza de contraseña:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-600' :
                    passwordStrength === 'normal' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)} ${
                      passwordStrength === 'weak' ? 'w-1/3' :
                      passwordStrength === 'normal' ? 'w-2/3' : 'w-full'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required={!isLogin}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden</p>
              )}
              {confirmPassword.length > 0 && password === confirmPassword && (
                <p className="mt-1 text-xs text-green-600">✓ Las contraseñas coinciden</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1E759B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a5f7a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E759B'}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setPassword('');
              setConfirmPassword('');
              setName('');
              setSelectedRoles([]);
            }}
            className="text-sm font-medium"
            style={{ color: '#1E759B' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1a5f7a'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#1E759B'}
          >
            {isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
