
import React, { useState, useMemo } from 'react';
import { getDaysInRange } from '../utils/dateUtils';

const StudentCalculator: React.FC = () => {
  const [totalHours, setTotalHours] = useState<string>('100');
  const [durationMonths, setDurationMonths] = useState<string>('2');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const totalHoursNum = useMemo(() => {
    const parsed = parseFloat(totalHours);
    return isNaN(parsed) || parsed < 0 ? 100 : parsed;
  }, [totalHours]);
  
  const durationMonthsNum = useMemo(() => {
    const parsed = parseInt(durationMonths);
    return isNaN(parsed) || parsed < 1 ? 2 : parsed;
  }, [durationMonths]);

  const calculation = useMemo(() => {
    const totalDays = getDaysInRange(startDate, durationMonthsNum);
    if (totalDays <= 0) return null;
    
    const hoursPerDayRaw = totalHoursNum / totalDays;
    const hours = Math.floor(hoursPerDayRaw);
    const minutes = Math.round((hoursPerDayRaw - hours) * 60);

    // Calcular fecha de finalización
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + durationMonthsNum);

    return {
      totalDays,
      hoursPerDayRaw,
      hours,
      minutes,
      endDate
    };
  }, [totalHoursNum, durationMonthsNum, startDate]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Calculadora de Estudo</h1>
        <p className="text-slate-500 mt-2">Planeje seu sucesso. Saiba exatamente quanto estudar por dia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                Total de Horas do Curso
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={totalHours}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir campo vacío o solo números
                    if (value === '' || /^\d+$/.test(value)) {
                      setTotalHours(value);
                    }
                  }}
                  min="0"
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Horas</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                Prazo de Conclusão
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={durationMonths}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir campo vacío o solo números
                    if (value === '' || /^\d+$/.test(value)) {
                      setDurationMonths(value);
                    }
                  }}
                  min="1"
                  className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Meses</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                Data de Início
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          {calculation && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 rounded-3xl shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -m-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              
              <div>
                <span className="text-indigo-100 text-sm font-semibold uppercase tracking-widest">Sua Meta Diária</span>
                <div className="text-6xl font-black mt-2 flex items-baseline gap-2">
                  {calculation.hours}
                  <span className="text-2xl font-light opacity-80">h</span>
                  {calculation.minutes}
                  <span className="text-2xl font-light opacity-80">m</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                <div>
                  <div className="text-indigo-200 text-xs uppercase font-bold">Total de Dias</div>
                  <div className="text-xl font-bold">{calculation.totalDays}</div>
                </div>
                <div>
                  <div className="text-indigo-200 text-xs uppercase font-bold">Meta Semanal</div>
                  <div className="text-xl font-bold">{(calculation.hoursPerDayRaw * 7).toFixed(1)}h</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="text-indigo-200 text-xs uppercase font-bold mb-2">Data de Conclusão</div>
                <div className="text-2xl font-bold">
                  {calculation.endDate.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              <p className="text-indigo-100 text-sm italic">
                Para terminar o curso de <b>{totalHoursNum}h</b> em <b>{durationMonthsNum} meses</b>, você precisa dedicar este tempo diariamente, sem faltas!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Dica de Estudante
        </h4>
        <p className="text-indigo-700 text-sm">
          A consistência é mais importante que a intensidade. Estudar 1h40 todos os dias é muito mais eficaz para a memorização do que estudar 12h apenas no final de semana. Utilize a técnica Pomodoro (25 min de estudo, 5 min de pausa) para manter o foco durante sua meta diária.
        </p>
      </div>
    </div>
  );
};

export default StudentCalculator;
