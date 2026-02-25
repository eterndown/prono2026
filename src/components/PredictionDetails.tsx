
import React from 'react';
import { Prediction, Match } from '../types';
// Import EQUIPOS to resolve team names from IDs
import { EQUIPOS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PredictionDetailsProps {
  prediction: Prediction;
  match: Match;
}

export const PredictionDetails: React.FC<PredictionDetailsProps> = ({ prediction, match }) => {
  // Find team names for the chart to fix missing property errors on 'Match' (Partido)
  const localTeam = EQUIPOS.find(t => t.id === match.equipoLocal);
  const visitorTeam = EQUIPOS.find(t => t.id === match.equipoVisitante);
  
  const homeName = localTeam?.nombre || match.placeholderLocal || 'Local';
  const awayName = visitorTeam?.nombre || match.placeholderVisitante || 'Visitante';

  const chartData = [
    { name: homeName, value: prediction.homeWinProb, color: '#10b981' },
    { name: 'Empate', value: prediction.drawProb, color: '#71717a' },
    { name: awayName, value: prediction.awayWinProb, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Probability Chart */}
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Probabilidades de Resultado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#fafafa' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-4 text-xs">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {(item.value * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Score & Confidence */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex-1 flex flex-col items-center justify-center">
            <span className="text-xs text-zinc-500 uppercase font-bold mb-2">Marcador Sugerido</span>
            <span className="text-5xl font-black text-emerald-400 tracking-tighter">{prediction.suggestedScore}</span>
            <div className="mt-4 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
               <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${prediction.confidence * 100}%` }} 
              />
            </div>
            <span className="text-[10px] text-zinc-500 mt-2 uppercase">Confianza de IA: {(prediction.confidence * 100).toFixed(0)}%</span>
          </div>
          
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Factores Clave</h3>
            <ul className="space-y-2">
              {prediction.keyFactors.map((factor, i) => (
                <li key={i} className="text-sm flex gap-3 text-zinc-300">
                  <span className="text-emerald-500 mt-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Full Analysis */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Análisis del Experto AI</h3>
        <p className="text-zinc-300 leading-relaxed text-sm italic">
          "{prediction.analysis}"
        </p>
      </div>

      {/* Sources */}
      {prediction.sources && prediction.sources.length > 0 && (
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Fuentes de Datos</h3>
          <div className="flex flex-wrap gap-2">
            {prediction.sources.map((source, i) => (
              <a
                key={i}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
              >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
