
import React, { useState } from 'react';
import { Employee, TimeLog } from '../types';
import { formatDate } from '../utils/dateUtils';

interface Props {
  employees: Employee[];
  onAddEmployee: (name: string) => void;
  onRemoveEmployee: (id: string) => void;
  onLogHours: (id: string, date: string, hours: number) => void;
}

const EmployerDashboard: React.FC<Props> = ({ employees, onAddEmployee, onRemoveEmployee, onLogHours }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logHoursVal, setLogHoursVal] = useState('8');

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  const calculateTotal = (logs: TimeLog[]) => logs.reduce((acc, log) => acc + log.hours, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Painel do Patrão</h1>
          <p className="text-slate-500">Gerencie sua equipe e monitore a carga horária de todos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
          style={{ backgroundColor: '#1E759B' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a5f7a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E759B'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Employee List Sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Equipe ({employees.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhum funcionário cadastrado.</div>
            ) : (
              employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`w-full text-left p-4 transition-colors flex justify-between items-center hover:bg-slate-50 ${selectedEmpId === emp.id ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-slate-600'}`}
                >
                  <div className="font-medium truncate">{emp.name}</div>
                  <div className="text-xs text-slate-400">{calculateTotal(emp.logs)}h</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detailed View / Logging */}
        <div className="lg:col-span-3 space-y-6">
          {selectedEmployee ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h2>
                  <p className="text-slate-500 text-sm">ID: {selectedEmployee.id.substring(0,8)}</p>
                </div>
                <button 
                  onClick={() => { if(confirm('Excluir funcionário?')) onRemoveEmployee(selectedEmployee.id); }}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remover
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-slate-700">Registrar Horas para {selectedEmployee.name}</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data</label>
                        <input 
                          type="date"
                          value={logDate}
                          onChange={(e) => setLogDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Horas</label>
                        <input 
                          type="number"
                          value={logHoursVal}
                          onChange={(e) => setLogHoursVal(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => onLogHours(selectedEmployee.id, logDate, parseFloat(logHoursVal))}
                      className="w-full py-2 text-white text-sm font-semibold rounded-lg"
                      style={{ backgroundColor: '#1E759B' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a5f7a'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E759B'}
                    >
                      Salvar Horas
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 text-slate-700">Histórico Recente</h3>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {selectedEmployee.logs.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">Sem registros ainda.</p>
                    ) : (
                      [...selectedEmployee.logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                        <div key={log.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-slate-600 font-medium">{formatDate(log.date)}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-bold">{log.hours}h</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-400">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Selecione um funcionário para ver os detalhes
            </div>
          )}
        </div>
      </div>

      {/* Modal (Simple version) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Adicionar Novo Funcionário</h3>
            <input 
              type="text" 
              autoFocus
              value={newEmpName}
              onChange={(e) => setNewEmpName(e.target.value)}
              placeholder="Nome completo do colaborador"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { if(newEmpName) { onAddEmployee(newEmpName); setNewEmpName(''); setShowAddModal(false); } }}
                className="flex-1 px-4 py-2 text-white font-medium rounded-lg"
                style={{ backgroundColor: '#1E759B' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a5f7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E759B'}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
