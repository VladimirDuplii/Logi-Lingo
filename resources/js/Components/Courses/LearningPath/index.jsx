import React, { useState, useMemo } from 'react';
import { ProgressBar } from '@/Components/ui';

// LearningPath: themable via Tailwind design tokens (brand / accent palettes)
// Supported theme aliases (legacy -> new): purple->violet, blue->sky, teal->teal
// New semantic variants: brand, violet, sky, teal, emerald
const VARIANT_ALIASES = { purple: 'violet', blue: 'sky', teal: 'teal' };

function useThemeVariant(raw) {
  return useMemo(() => VARIANT_ALIASES[raw] || raw || 'brand', [raw]);
}

const VARIANT_STYLES = {
  brand:   { grad: 'from-brand-500 to-brand-600', bar: 'bg-brand-500', track: 'bg-brand-200', path: 'bg-brand-500', nodeBg: 'bg-white', nodeBorder: 'border-brand-200', hover: 'hover:border-brand-300' },
  violet:  { grad: 'from-violet-500 to-fuchsia-600', bar: 'bg-violet-500', track: 'bg-violet-200', path: 'bg-violet-500', nodeBg: 'bg-white', nodeBorder: 'border-violet-200', hover: 'hover:border-violet-300' },
  sky:     { grad: 'from-sky-500 to-blue-600', bar: 'bg-sky-500', track: 'bg-sky-200', path: 'bg-sky-500', nodeBg: 'bg-white', nodeBorder: 'border-sky-200', hover: 'hover:border-sky-300' },
  teal:    { grad: 'from-teal-500 to-emerald-600', bar: 'bg-teal-500', track: 'bg-teal-200', path: 'bg-teal-500', nodeBg: 'bg-white', nodeBorder: 'border-teal-200', hover: 'hover:border-teal-300' },
  emerald: { grad: 'from-accent-500 to-accent-600', bar: 'bg-accent-500', track: 'bg-accent-500/20', path: 'bg-accent-500', nodeBg: 'bg-white', nodeBorder: 'border-accent-500/40', hover: 'hover:border-accent-500' },
};

export default function LearningPath({ units = [], onLessonSelect }) {
  const [hovered, setHovered] = useState(null);
  const safeUnits = units || [];

  return (
    <div className="ui-card-clean p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🚀</span>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-800">Навчальний шлях</h3>
      </div>
      <div className="space-y-16">
        {safeUnits.map((unit,uIdx)=>{
          const variantKey = useThemeVariant(unit.theme);
          const t = VARIANT_STYLES[variantKey] || VARIANT_STYLES.brand;
          const lessons = unit.lessons||[];
          const completed = lessons.filter(l=>l.completed).length;
          const progressPct = lessons.length?Math.round((completed/lessons.length)*100):0;
          return (
            <div key={uIdx} className="relative">
              {uIdx>0 && <div className="absolute left-8 -top-12 w-1 h-12 bg-gradient-to-b from-transparent to-gray-200" />}
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform duration-300 hover:scale-105 ${unit.unlocked?`bg-gradient-to-br ${t.grad} text-white`:'bg-gray-200 text-gray-500'}`}>{unit.icon||'📦'}</div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg md:text-xl font-semibold ${!unit.unlocked?'text-gray-400':'text-gray-800'}`}>{unit.title}</h4>
                  {unit.unlocked && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1 text-xs text-gray-500"><span>{completed} з {lessons.length} завершено</span><span className={`font-medium ${t.bar.replace('bg-','text-')}`}>{progressPct}%</span></div>
                      <ProgressBar value={progressPct} height="h-1.5" trackClass={t.track} fillClass={t.bar} />
                    </div>
                  )}
                </div>
                {!unit.unlocked && <div className="ml-auto text-gray-400" title="Locked">🔒</div>}
              </div>
              <div className={`ml-4 md:ml-8 pl-4 md:pl-8 relative ${unit.unlocked?'':'opacity-50'} group`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.path} rounded-full transition-colors duration-300 group-hover:brightness-110`} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {lessons.map((lesson,lIdx)=>{
                    const key = `${uIdx}-${lIdx}`;
                    const clickable = unit.unlocked;
                    const base = lesson.completed
                      ? `border-${t.nodeBorder?.replace('border-','')} shadow-sm ${hovered===key?'transform scale-105 shadow-md':''} cursor-pointer bg-white`
                      : `${t.nodeBg} ${t.nodeBorder} ${t.hover} hover:shadow-md ${clickable?'cursor-pointer':'cursor-not-allowed opacity-60'}`;
                    return (
                      <div
                        key={key}
                        onMouseEnter={()=>setHovered(key)}
                        onMouseLeave={()=>setHovered(null)}
                        onClick={() => clickable && onLessonSelect && onLessonSelect(lesson, unit)}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 relative ${base}`}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className={`text-3xl ${lesson.completed?'animate-bounce-small':''}`}>{lesson.character||'📘'}</div>
                          <div className="font-semibold text-gray-800 mt-1 line-clamp-2 text-sm">{lesson.name}</div>
                          {lesson.completed && (
                            <div className="flex mt-1">
                              {[...Array(lesson.stars||0)].map((_,i)=>(<span key={i} className="text-yellow-400">⭐</span>))}
                            </div>
                          )}
                        </div>
                        {lesson.completed && <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-md" title="Completed">✅</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
