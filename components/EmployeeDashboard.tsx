
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, User } from '../types';
import SummaryCards from './SummaryCards';
import { formatDate } from '../utils/dateUtils';

interface Props {
  employees: Employee[];
  onAddEmployee: (name: string) => void;
  onLogHours: (id: string, date: string, hours: number) => void;
  onRemoveHours: (id: string, date: string) => void;
  currentEmployeeId: string | null;
  onSetCurrentEmployee: (id: string) => void;
  currentUser: User;
}

const EmployeeDashboard: React.FC<Props> = ({ 
  employees, 
  onAddEmployee, 
  onLogHours,
  onRemoveHours,
  currentEmployeeId,
  onSetCurrentEmployee,
  currentUser
}) => {
  const [newName, setNewName] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logHoursVal, setLogHoursVal] = useState('8');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDateForAction, setSelectedDateForAction] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<string>('');

  // Usar el empleado actual o crear uno basado en el usuario si no existe
  const currentEmployee = useMemo(() => {
    if (currentEmployeeId) {
      return employees.find(e => e.id === currentEmployeeId);
    }
    // Si no hay empleado actual, buscar uno con el mismo nombre del usuario o usar el primero
    const employeeByName = employees.find(e => e.name === currentUser.name);
    if (employeeByName) {
      return employeeByName;
    }
    return employees.length > 0 ? employees[0] : null;
  }, [employees, currentEmployeeId, currentUser]);
  
  // Asegurar que currentEmployeeId esté establecido
  useEffect(() => {
    if (currentEmployee && currentEmployee.id !== currentEmployeeId) {
      onSetCurrentEmployee(currentEmployee.id);
    }
  }, [currentEmployee, currentEmployeeId, onSetCurrentEmployee]);


  // Obtener logs del mes actual
  const monthlyLogs = useMemo(() => {
    if (!currentEmployee) return {};
    const logsMap: Record<string, number> = {};
    currentEmployee.logs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear) {
        logsMap[log.date] = log.hours;
      }
    });
    return logsMap;
  }, [currentEmployee, currentMonth, currentYear]);

  // Calcular total acumulado de horas (todas las horas registradas)
  const totalAccumulatedHours = useMemo(() => {
    if (!currentEmployee) return 0;
    return currentEmployee.logs.reduce((sum: number, log) => sum + log.hours, 0);
  }, [currentEmployee]);

  // Calcular salario total acumulado
  const totalSalary = useMemo(() => {
    if (!hourlyRate || isNaN(parseFloat(hourlyRate))) return 0;
    return totalAccumulatedHours * parseFloat(hourlyRate);
  }, [totalAccumulatedHours, hourlyRate]);

  // Generar calendario del mes
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ day: number; date: string; hours: number | null; dayOfWeek: number }> = [];
    
    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: 0, date: '', hours: null, dayOfWeek: i });
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      days.push({
        day,
        date: dateStr,
        hours: monthlyLogs[dateStr] || null,
        dayOfWeek: dateObj.getDay()
      });
    }
    
    return days;
  }, [currentMonth, currentYear, monthlyLogs]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handleDateClick = (date: string, event?: React.MouseEvent) => {
    if (!date) return;
    
    // Si el día tiene horas registradas, mostrar menú de acciones
    if (monthlyLogs[date]) {
      event?.stopPropagation();
      setSelectedDateForAction(date);
      setShowActionMenu(true);
    } else {
      // Si no tiene horas, seleccionar para agregar
      setLogDate(date);
      setLogHoursVal('8');
    }
  };

  const handleEditHours = () => {
    if (!selectedDateForAction || !currentEmployeeId) return;
    setLogDate(selectedDateForAction);
    const existingHours = monthlyLogs[selectedDateForAction];
    if (existingHours) {
      setLogHoursVal(existingHours.toString());
    }
    setShowActionMenu(false);
    setSelectedDateForAction(null);
  };

  const handleDeleteHours = () => {
    if (!selectedDateForAction || !currentEmployeeId) return;
    onRemoveHours(currentEmployeeId, selectedDateForAction);
    setShowActionMenu(false);
    setSelectedDateForAction(null);
    // Si la fecha eliminada era la seleccionada, limpiar el formulario
    if (selectedDateForAction === logDate) {
      setLogDate(new Date().toISOString().split('T')[0]);
      setLogHoursVal('8');
    }
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEmployeeId && logDate && logHoursVal) {
      const isUpdate = monthlyLogs[logDate] !== undefined;
      onLogHours(currentEmployeeId, logDate, parseFloat(logHoursVal));
      
      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      // Resetear formulario después de guardar
      setLogDate(new Date().toISOString().split('T')[0]);
      setLogHoursVal('8');
    }
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionMenu) {
        setShowActionMenu(false);
        setSelectedDateForAction(null);
      }
    };
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionMenu]);

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao ChronosFlow</h2>
        <p className="text-slate-500 mb-6 max-w-md">Para começar a registrar suas horas, por favor insira seu nome abaixo.</p>
        <div className="flex gap-2 w-full max-w-sm">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Seu nome"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={() => { if(newName) { onAddEmployee(newName); setNewName(''); } }}
            className="px-6 py-2 text-white font-medium rounded-lg transition-colors"
            style={{ backgroundColor: '#1E759B' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a5f7a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E759B'}
          >
            Começar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{currentUser.name}</h1>
          <p className="text-slate-500">Acompanhe seu rendimento diário e mensal.</p>
        </div>
      </div>

      <SummaryCards logs={currentEmployee?.logs || []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Card de Registrar Horas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registrar Horas
            </h3>
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
                <input 
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Quantidade de Horas</label>
                <input 
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={logHoursVal}
                  onChange={(e) => setLogHoursVal(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: '#1E759B' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a5f7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E759B'}
              >
                {monthlyLogs[logDate] ? 'Atualizar' : 'Salvar'} Registro
              </button>
              
              {showSuccessMessage && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2 animate-in fade-in duration-300">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hora atualizada com sucesso!</span>
                </div>
              )}
            </form>
          </div>

          {/* Card de Calcular o Salário */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Calcular o Salário
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Valor por Hora (€)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total de Horas (Acumulado):</span>
                    <span className="text-sm font-semibold text-slate-800">{totalAccumulatedHours.toFixed(1)}h</span>
                  </div>
                  
                  {hourlyRate && !isNaN(parseFloat(hourlyRate)) && parseFloat(hourlyRate) > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Valor por Hora:</span>
                        <span className="text-sm font-semibold text-slate-800">€{parseFloat(hourlyRate).toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-slate-700">Salário Total:</span>
                          <span className="text-xl font-bold text-indigo-600">€{totalSalary.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Atividade Mensal
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={() => changeMonth('next')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((item, index) => {
              const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6; // 0 = Domingo, 6 = Sábado
              
              return (
              <div key={index} className="relative">
                <div
                  onClick={(e) => item.date && handleDateClick(item.date, e)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all cursor-pointer
                    ${item.day === 0 
                      ? 'border-transparent cursor-default' 
                      : isWeekend
                      ? item.date === logDate
                        ? 'border-indigo-600 bg-indigo-100 shadow-md'
                        : item.hours !== null
                        ? 'border-indigo-300 bg-indigo-100 hover:border-indigo-400 hover:bg-indigo-150'
                        : 'border-slate-200 bg-slate-100 hover:border-indigo-300 hover:bg-indigo-50'
                      : item.date === logDate
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : item.hours !== null
                      ? 'border-indigo-300 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100'
                      : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'
                    }
                  `}
                >
                  {item.day > 0 && (
                    <>
                      <span className={`text-sm font-medium ${item.hours !== null ? 'text-indigo-700' : 'text-slate-600'}`}>
                        {item.day}
                      </span>
                      {item.hours !== null && (
                        <span className="text-xs text-indigo-600 font-semibold mt-1">
                          {item.hours}h
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Menú de acciones cuando hay horas registradas */}
                {showActionMenu && selectedDateForAction === item.date && item.day > 0 && (
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditHours();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Horas
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHours();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar Horas
                    </button>
                  </div>
                )}
              </div>
            );
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-indigo-300 bg-indigo-50"></div>
              <span>Com horas registradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-slate-200 bg-slate-50"></div>
              <span>Sem registro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
