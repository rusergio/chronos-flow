
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppState } from '../types';

interface Props {
  state: AppState;
}

const AIScheduler: React.FC<Props> = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const getAIAdvice = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentEmp = state.employees.find(e => e.id === state.currentEmployeeId);
      
      const context = `
        User Role: ${state.role}
        Current Employee Name: ${currentEmp?.name || 'N/A'}
        Number of Employees: ${state.employees.length}
        Recent Logs: ${JSON.stringify(currentEmp?.logs.slice(-5))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise estes dados de gestão de tempo e dê um conselho curto e motivador em português (Brasil) para o usuário sobre produtividade ou equilíbrio entre vida pessoal e trabalho: ${context}`,
        config: {
          systemInstruction: "Você é um assistente de produtividade inteligente e empático. Seus conselhos devem ser curtos (máximo 3 frases) e baseados na realidade de um trabalhador ou estudante."
        }
      });

      setInsight(response.text || "Continue o bom trabalho!");
    } catch (error) {
      console.error(error);
      setInsight("Tive um problema ao processar seu conselho, mas lembre-se: pausas regulares aumentam a produtividade!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <span className="font-bold text-sm">Assistente AI</span>
            <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {!insight ? (
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-4">Clique abaixo para receber um conselho baseado no seu histórico.</p>
                <button 
                  onClick={getAIAdvice}
                  disabled={loading}
                  className="w-full py-2 bg-slate-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-slate-200 disabled:opacity-50"
                >
                  {loading ? 'Pensando...' : 'Pedir Conselho AI'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed italic">"{insight}"</p>
                <button 
                  onClick={() => setInsight(null)}
                  className="w-full py-1 text-xs text-slate-400 hover:text-slate-600"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all active:scale-95"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    </div>
  );
};

export default AIScheduler;
