
import React, { useMemo } from 'react';
import { TimeLog } from '../types';
import { getWeekNumber, getMonthYear } from '../utils/dateUtils';

interface Props {
  logs: TimeLog[];
}

const SummaryCards: React.FC<Props> = ({ logs }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentMonth = getMonthYear(now);

    const weeklyTotal = logs.reduce((acc, log) => {
      const logDate = new Date(log.date);
      if (getWeekNumber(logDate) === currentWeek) return acc + log.hours;
      return acc;
    }, 0);

    const monthlyTotal = logs.reduce((acc, log) => {
      const logDate = new Date(log.date);
      if (getMonthYear(logDate) === currentMonth) return acc + log.hours;
      return acc;
    }, 0);

    const totalAllTime = logs.reduce((acc, log) => acc + log.hours, 0);

    return { weeklyTotal, monthlyTotal, totalAllTime };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Semanal</span>
          <div className="text-3xl font-black text-indigo-600 mt-1">{stats.weeklyTotal}h</div>
          <p className="text-xs text-slate-400 mt-2">Nesta semana</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Mensal</span>
          <div className="text-3xl font-black text-violet-600 mt-1">{stats.monthlyTotal}h</div>
          <p className="text-xs text-slate-400 mt-2">Neste mês</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Acumulado Geral</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats.totalAllTime}h</div>
          <p className="text-xs text-slate-400 mt-2">Desde o início</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
