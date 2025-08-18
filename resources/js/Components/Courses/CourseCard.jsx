import React from "react";
import { router } from "@inertiajs/react";
import { CourseService } from "../../Services";

const CourseCard = ({ course, onClick }) => {
    const handleView = (e) => {
        e.stopPropagation();
        if (onClick) onClick();
        else router.visit(`/courses/${course.id}`);
    };

    const handleStart = async (e) => {
        e.stopPropagation();
        try {
            await CourseService.setActiveCourse(course.id);
        } catch (err) {
            // non-blocking
            console.error("Failed to set active course:", err);
        }
        router.visit(`/courses/${course.id}?start=1`);
    };

    const themes = {
        blue:   { from: 'from-sky-400',    to: 'to-blue-500',   ring: 'ring-sky-300',    focus: 'focus:ring-sky-500',    hover: 'hover:bg-sky-50',    pill: 'bg-sky-100 text-sky-700',    border: 'border-sky-300',    badge: '🧮', primaryBg: 'bg-blue-500',   primaryHover: 'hover:bg-blue-600' },
        green:  { from: 'from-green-400',  to: 'to-emerald-500', ring: 'ring-green-300',  focus: 'focus:ring-green-500',  hover: 'hover:bg-green-50',  pill: 'bg-green-100 text-green-700',  border: 'border-green-300',  badge: '🧠', primaryBg: 'bg-green-500',  primaryHover: 'hover:bg-green-600' },
        purple: { from: 'from-purple-400', to: 'to-fuchsia-500', ring: 'ring-purple-300', focus: 'focus:ring-purple-500', hover: 'hover:bg-purple-50', pill: 'bg-purple-100 text-purple-700', border: 'border-purple-300', badge: '📚', primaryBg: 'bg-fuchsia-500', primaryHover: 'hover:bg-fuchsia-600' },
        orange: { from: 'from-amber-400',  to: 'to-orange-500',  ring: 'ring-amber-300',  focus: 'focus:ring-amber-500',  hover: 'hover:bg-amber-50',  pill: 'bg-amber-100 text-amber-700',  border: 'border-amber-300',  badge: '🔬', primaryBg: 'bg-orange-500', primaryHover: 'hover:bg-orange-600' },
    };
    const pickTheme = (c) => {
        const title = (c?.title || '').toLowerCase();
        if (/(math|математ)/.test(title)) return themes.blue;           // Математика → синій
        if (/(logic|логік|мислен)/.test(title)) return themes.green;    // Логіка → зелений
        if (/(read|читан|letters|букв)/.test(title)) return themes.purple; // Читання/букви → фіолетовий
        if (/(science|наук|природ)/.test(title)) return themes.orange;  // Наука → помаранчевий
        const order = ['green','blue','purple','orange'];
        const idx = (c?.id ?? 0) % order.length;
        return themes[order[idx]];
    };
    const theme = pickTheme(course);
    const Icon = () => (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 14.93V13h3.93A8.034 8.034 0 0 1 13 16.93ZM11 13v3.93A8.034 8.034 0 0 1 7.07 13H11Zm0-2H7.07A8.034 8.034 0 0 1 11 7.07V11Zm2 0V7.07A8.034 8.034 0 0 1 16.93 11H13Z"/>
        </svg>
    );
    // Lightweight confetti without external deps
    const ensureConfettiStyles = () => {
        if (typeof document === 'undefined') return;
        if (document.getElementById('confetti-keyframes')) return;
        const style = document.createElement('style');
        style.id = 'confetti-keyframes';
        style.textContent = `
@keyframes confetti-pop { 0%{transform:translate(0,0) scale(0.6) rotate(0deg); opacity:1} 80%{opacity:1} 100%{transform:translate(var(--dx), var(--dy)) scale(1) rotate(360deg); opacity:0} }
`;
        document.head.appendChild(style);
    };
    const rootRef = React.useRef(null);
    const launchConfetti = () => {
        if (typeof document === 'undefined') return;
        ensureConfettiStyles();
        const root = rootRef.current;
        if (!root) return;
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.inset = '0';
        container.style.overflow = 'hidden';
        container.style.pointerEvents = 'none';
        root.appendChild(container);
        const colors = ['#60a5fa','#34d399','#f472b6','#f59e0b','#a78bfa','#22d3ee'];
        const count = 18;
        for (let i=0;i<count;i++){
            const s = document.createElement('span');
            const size = 6 + Math.random()*6;
            const dx = (Math.random()*160 - 80) + 'px';
            const dy = (Math.random()*-120 - 40) + 'px';
            s.style.setProperty('--dx', dx);
            s.style.setProperty('--dy', dy);
            s.style.position = 'absolute';
            s.style.left = (50 + (Math.random()*20 - 10)) + '%';
            s.style.top = '50%';
            s.style.width = size + 'px';
            s.style.height = size + 'px';
            s.style.background = colors[i % colors.length];
            s.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
            s.style.transform = 'translate(0,0)';
            s.style.animation = 'confetti-pop 700ms ease-out forwards';
            s.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3) inset';
            container.appendChild(s);
        }
        setTimeout(()=>{ container.remove(); }, 900);
    };

    return (
        <div
            className={`group relative flex flex-col rounded-3xl bg-white shadow-md border-4 ${theme.border} hover:shadow-xl transition-transform hover:-translate-y-0.5 cursor-pointer`}
            onClick={handleView}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" ? handleView(e) : null)}
            ref={rootRef}
        >
            {/* playful corner sticker */}
            <div className="absolute right-3 top-3 select-none">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-lg" title="Course vibe">
                    <span aria-hidden>{theme.badge}</span>
                </div>
            </div>
            <div className="flex items-center gap-4 p-5">
                <div className={`h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} text-white text-2xl font-bold shadow-inner`}
                >
                    {course.image_url ? (
                        <img
                            className="h-14 w-14 rounded-2xl object-cover"
                            src={course.image_url}
                            alt={course.title}
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.src =
                                    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                            }}
                        />
                    ) : (
                        <Icon />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-lg font-semibold text-gray-800">
                        {course.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {course.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className={`inline-flex items-center rounded-full ${theme.pill} px-2.5 py-0.5 font-medium`}>
                            {course.level || "Beginner"}
                        </span>
                        <span className={`inline-flex items-center rounded-full ${theme.pill} px-2.5 py-0.5 font-medium`}>
                            {course.units_count} units
                        </span>
                    </div>
                </div>
            </div>
        <div className="flex gap-3 px-5 pb-5">
                <button
                    onClick={(e)=>{ e.stopPropagation(); launchConfetti(); handleStart(e); }}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.primaryBg} ${theme.primaryHover} ${theme.focus}`}
                    aria-label="Start learning"
                >
                    Почати навчання
                </button>
                <button
                    onClick={handleView}
            className={`inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-inset ${theme.ring} ${theme.hover}`}
                >
                    Переглянути курс
                </button>
            </div>
            {/* bottom bar removed as requested */}
        </div>
    );
};

export default CourseCard;
