import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CourseService, ProgressService } from "../../Services";
import { useToast } from "@/Components/Toast";

const Heart = ({ filled }) => (
    <svg width="28" height="23" viewBox="0 0 28 23" fill="none">
        <path
            d="M14 22s-6.716-3.725-10.5-7.5C.69 11.69.69 7.31 3.5 4.5 6.31 1.69 10.69 1.69 13.5 4.5L14 5l.5-.5c2.81-2.81 7.19-2.81 10 0 2.81 2.81 2.81 7.19 0 10C20.716 18.275 14 22 14 22z"
            fill={filled ? "#ff4b4b" : "none"}
            stroke="#ff4b4b"
            strokeWidth="2"
        />
    </svg>
);

const ProgressBar = ({ value, total, onExit, hearts }) => {
    const ratio = total === 0 ? 0 : value / total;
    return (
        <header className="flex items-center gap-4">
            <button
                className="text-gray-400"
                onClick={onExit}
                aria-label="Exit lesson"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            </button>
            <div
                className="h-4 grow rounded-full bg-gray-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={ratio}
            >
                <div
                    className={
                        "h-full rounded-full bg-green-500 transition-all duration-700 " +
                        (value > 0 ? "px-2 pt-1 " : "")
                    }
                    style={{ width: `${ratio * 100}%` }}
                >
                    <div className="h-[5px] w-full rounded-full bg-green-400"></div>
                </div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <Heart key={i} filled={hearts === null ? false : i <= hearts} />
            ))}
        </header>
    );
};

const CheckPanel = ({
    isAnswerSelected,
    isAnswerCorrect,
    correctAnswerShown,
    correctAnswer,
    onCheckAnswer,
    onFinish,
    onSkip,
}) => {
    return (
        <>
            <section className="border-gray-200 sm:border-t-2 sm:p-10">
                <div className="mx-auto flex max-w-5xl sm:justify-between">
                    <button
                        className="hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 font-bold uppercase text-gray-400 transition hover:border-gray-300 hover:bg-gray-200 sm:block sm:min-w-[150px] sm:max-w-fit"
                        onClick={onSkip}
                    >
                        Skip
                    </button>
                    {isAnswerSelected ? (
                        <button
                            onClick={onCheckAnswer}
                            className="flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
                        >
                            Check
                        </button>
                    ) : (
                        <button
                            className="grow rounded-2xl bg-gray-200 p-3 font-bold uppercase text-gray-400 sm:min-w-[150px] sm:max-w-fit sm:grow-0"
                            disabled
                        >
                            Check
                        </button>
                    )}
                </div>
            </section>

            <div
                className={
                    correctAnswerShown
                        ? isAnswerCorrect
                            ? "fixed bottom-0 left-0 right-0 bg-lime-100 font-bold text-green-600 transition-all"
                            : "fixed bottom-0 left-0 right-0 bg-red-100 font-bold text-red-500 transition-all"
                        : "fixed -bottom-52 left-0 right-0"
                }
            >
                <div className="flex max-w-5xl flex-col gap-4 p-5 sm:mx-auto sm:flex-row sm:items-center sm:justify-between sm:p-10 sm:py-14">
                    {isAnswerCorrect ? (
                        <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="hidden rounded-full bg-white p-5 text-green-500 sm:block">
                                ✓
                            </div>
                            <div className="text-2xl">Good job!</div>
                        </div>
                    ) : (
                        <div className="mb-2 flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="hidden rounded-full bg-white p-5 text-red-500 sm:block">
                                ✕
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl">
                                    Correct solution:
                                </div>{" "}
                                <div className="text-sm font-normal">
                                    {correctAnswer}
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        className={
                            "flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
                        }
                        onClick={onFinish}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </>
    );
};

const MultipleChoice = ({ question, selected, setSelected }) => {
    const answers = question.options || [];
    const count = answers.length;
    // Dynamic grid: 2/3/4 per row on >= sm, allow wrap on base
    const smCols =
        count <= 2
            ? "sm:grid-cols-2"
            : count === 3
            ? "sm:grid-cols-3"
            : "sm:grid-cols-4";
    const baseCols = count <= 2 ? "grid-cols-2" : "grid-cols-2"; // on very small screens keep 2 per row
    return (
        <section className="flex max-w-2xl grow flex-col gap-5 self-center sm:items-center sm:justify-center sm:gap-24 sm:px-5">
            <h1 className="self-start text-2xl font-bold sm:text-3xl">
                {question.text}
            </h1>
            {question.image_url ? (
                <div className="w-full flex items-center justify-center">
                    <img
                        src={question.image_url}
                        alt="Question"
                        className="max-h-48 w-auto object-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </div>
            ) : null}
            <div
                className={`grid ${baseCols} ${smCols} gap-2`}
                role="radiogroup"
            >
                {answers.map((ans, i) => (
                    <div
                        key={ans.id}
                        className={
                            i === selected
                                ? "cursor-pointer rounded-xl border-2 border-b-4 border-blue-300 bg-blue-100 p-4 text-blue-400"
                                : "cursor-pointer rounded-xl border-2 border-b-4 border-gray-200 p-4 hover:bg-gray-100"
                        }
                        role="radio"
                        aria-checked={i === selected}
                        tabIndex={0}
                        onClick={() => setSelected(i)}
                    >
                        {ans.image_url ? (
                            <img
                                src={ans.image_url}
                                alt=""
                                className="mb-2 h-24 w-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : null}
                        <h2 className="text-center">{ans.text}</h2>
                    </div>
                ))}
            </div>
        </section>
    );
};

const WriteIn = ({ question, selectedIndices, setSelectedIndices }) => {
    const answerTiles = (question.options || []).map((o) => o.text);
    const correctIndices = (question.options || [])
        .map((o, i) => (o.is_correct ? i : -1))
        .filter((i) => i !== -1);

    return (
        <section className="flex max-w-2xl grow flex-col gap-5 self-center sm:items-center sm:justify-center sm:gap-24">
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
                Write this in English
            </h1>
            {question.image_url ? (
                <div className="w-full flex items-center justify-center">
                    <img
                        src={question.image_url}
                        alt="Question"
                        className="max-h-48 w-auto object-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </div>
            ) : null}
            {question.text ? (
                <p className="text-center text-gray-700">{question.text}</p>
            ) : null}
            <div className="w-full">
                <div className="flex min-h-[60px] flex-wrap gap-1 border-b-2 border-t-2 border-gray-200 py-1">
                    {selectedIndices.map((i) => (
                        <button
                            key={i}
                            className="rounded-2xl border-2 border-b-4 border-gray-200 p-2 text-gray-700"
                            onClick={() =>
                                setSelectedIndices((xs) =>
                                    xs.filter((x) => x !== i)
                                )
                            }
                        >
                            {answerTiles[i]}
                        </button>
                    ))}
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {answerTiles.map((word, i) => (
                        <button
                            key={i}
                            className={
                                selectedIndices.includes(i)
                                    ? "rounded-2xl border-2 border-b-4 border-gray-200 bg-gray-200 p-2 text-gray-200"
                                    : "rounded-2xl border-2 border-b-4 border-gray-200 p-2 text-gray-700"
                            }
                            disabled={selectedIndices.includes(i)}
                            onClick={() =>
                                setSelectedIndices((xs) =>
                                    xs.includes(i) ? xs : [...xs, i]
                                )
                            }
                        >
                            {word}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Lightweight confetti (no extra deps); shared style injected once
const ensureConfettiStyles = () => {
    if (document.getElementById("confetti-keyframes")) return;
    const style = document.createElement("style");
    style.id = "confetti-keyframes";
    style.textContent = `@keyframes confetti-pop { 0%{transform:translate(0,0) scale(0.6) rotate(0deg); opacity:1} 80%{opacity:1} 100%{transform:translate(var(--dx), var(--dy)) scale(1) rotate(360deg); opacity:0} }`;
    document.head.appendChild(style);
};

const launchConfetti = (count = 36) => {
    ensureConfettiStyles();
    const colors = ["#f97316", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ef4444"];
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
    const { innerWidth: w, innerHeight: h } = window;
    const cx = w / 2, cy = h / 4; // start a bit above center
    for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        const size = Math.random() * 8 + 6;
        const dx = (Math.random() - 0.5) * w * 0.9;
        const dy = Math.random() * h * 0.9 + h * 0.1;
        s.style.position = "absolute";
        s.style.left = `${cx}px`;
        s.style.top = `${cy}px`;
        s.style.width = `${size}px`;
        s.style.height = `${size * 0.6}px`;
        s.style.borderRadius = "2px";
        s.style.transform = "translate(-50%, -50%)";
        s.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        s.style.setProperty("--dx", `${dx}px`);
        s.style.setProperty("--dy", `${dy}px`);
        s.style.animation = `confetti-pop ${700 + Math.random() * 500}ms ease-out forwards`;
        container.appendChild(s);
    }
    setTimeout(() => container.remove(), 1600);
};

const useCountUp = (to = 0, durationMs = 800) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const start = performance.now();
        let raf;
        const tick = (t) => {
            const p = Math.min(1, (t - start) / durationMs);
            setVal(Math.round(p * to));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [to, durationMs]);
    return val;
};

const LessonComplete = ({ correct, total, onExit, displayXp }) => {
    const [fired, setFired] = useState(false);
    const xp = useCountUp(Math.max(0, Number(displayXp) || 0), 900);
    const acc = useCountUp(Math.round((correct / Math.max(total, 1)) * 100), 900);

    useEffect(() => {
        if (!fired) {
            setFired(true);
            launchConfetti(40);
        }
    }, [fired]);

    return (
        <div className="flex min-h-screen flex-col gap-5">
            <div className="flex grow flex-col items-center justify-center gap-8 font-bold">
                <motion.h1
                    className="text-center text-3xl text-yellow-400"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 12 }}
                >
                    Lesson Complete!
                </motion.h1>
                <div className="flex flex-wrap justify-center gap-5">
                    <motion.div
                        className="min-w-[140px] rounded-xl border-2 border-yellow-400 bg-yellow-400"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.05 }}
                    >
                        <h2 className="py-1 text-center text-white">Total XP</h2>
                        <div className="flex justify-center rounded-xl bg-white py-5 text-3xl text-yellow-400">
                            {xp}
                        </div>
                    </motion.div>
                    <motion.div
                        className="min-w-[140px] rounded-xl border-2 border-green-400 bg-green-400"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        <h2 className="py-1 text-center text-white">Accuracy</h2>
                        <div className="flex justify-center rounded-xl bg-white py-5 text-3xl text-green-400">
                            {acc}%
                        </div>
                    </motion.div>
                </div>
            </div>
            <section className="border-gray-200 sm:border-t-2 sm:p-10">
                <div className="mx-auto flex max-w-5xl sm:justify-between">
                    <motion.button
                        className="hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-3 font-bold uppercase text-gray-400 transition hover:border-gray-300 hover:bg-gray-200 sm:block sm:min-w-[150px] sm:max-w-fit"
                        onClick={onExit}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Review lesson
                    </motion.button>
                    <motion.button
                        className={
                            "flex w-full items-center justify-center rounded-2xl border-b-4 border-green-600 bg-green-500 p-3 font-bold uppercase text-white transition hover:brightness-105 sm:min-w-[150px] sm:max-w-fit"
                        }
                        onClick={onExit}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        Continue
                    </motion.button>
                </div>
            </section>
        </div>
    );
};

const DuoLesson = ({ courseId, unitId, lessonId, onExit }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [correctShown, setCorrectShown] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [hearts, setHearts] = useState(null);
    const [noHearts, setNoHearts] = useState(false);
    const [refillMsg, setRefillMsg] = useState("");
    // Keep this state before any early returns to preserve hook order
    const [completed, setCompleted] = useState(false);
    const [awardedXp, setAwardedXp] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const res = await CourseService.getQuestions(
                    courseId,
                    unitId,
                    lessonId
                );
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data || [];
                if (mounted) setQuestions(data);
                // Fetch hearts
                try {
                    const p = await ProgressService.getUserProgress();
                    const heartsVal = p?.data?.hearts ?? p?.hearts ?? null;
                    setHearts(typeof heartsVal === "number" ? heartsVal : null);
                    if ((heartsVal ?? 0) <= 0) setNoHearts(true);
                } catch (_) {
                    /* ignore */
                }
            } catch (e) {
                setError("Failed to load questions.");
                toast?.error?.("Не вдалося завантажити питання.");
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [courseId, unitId, lessonId]);

    useEffect(() => {
        // reset per-question state
        setSelected(null);
        setSelectedIndices([]);
        setCorrectShown(false);
    }, [index]);

    // Mark lesson completed once all questions are answered
    useEffect(() => {
        if (
            correctCount + incorrectCount >= questions.length &&
            questions.length > 0
        ) {
            setCompleted(true);
        }
    }, [correctCount, incorrectCount, questions.length]);

    // On first transition to completed, award points once (must be before any early returns)
    useEffect(() => {
        if (completed) {
            (async () => {
                try {
                    const res = await ProgressService.completeLesson(
                        lessonId,
                        correctCount,
                        questions.length
                    );
                    const xp = res?.data?.awarded_xp ?? res?.awarded_xp ?? null;
                    if (xp != null) {
                        setAwardedXp(xp);
                        toast?.success?.(`Урок завершено: +${xp} XP`);
                    }
                } catch (_) {
                    /* ignore */
                }
            })();
        }
    }, [completed, lessonId, correctCount, questions.length]);

    if (loading) return <div>Loading lesson...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!questions.length)
        return <div>No questions available for this lesson.</div>;

    const q = questions[index];
    const totalNeeded = questions.length; // keep 1 question == 1 step

    const mcMode = (q.options || []).filter((o) => o.is_correct).length === 1;

    const checkAnswer = async () => {
        let correct = false;
        if (mcMode) {
            correct = q.options?.[selected]?.is_correct === true;
        } else {
            const correctIndices = q.options
                .map((o, i) => (o.is_correct ? i : -1))
                .filter((i) => i !== -1);
            // require exact sequence match
            correct =
                selectedIndices.length === correctIndices.length &&
                selectedIndices.every((v, i) => v === correctIndices[i]);
        }

        setIsCorrect(correct);
        setCorrectShown(true);

        try {
            await ProgressService.updateChallengeProgress(q.id, correct);
            if (!correct) {
                const r = await ProgressService.reduceHearts(q.id);
                const newHearts = r?.data?.hearts ?? r?.hearts;
                if (typeof newHearts === "number") {
                    setHearts(newHearts);
                    if (newHearts <= 0) setNoHearts(true);
                } else {
                    setHearts((h) =>
                        typeof h === "number" ? Math.max(h - 1, 0) : h
                    );
                    setNoHearts((h) => true);
                }
            }
            if (correct) setCorrectCount((c) => c + 1);
            else setIncorrectCount((c) => c + 1);
        } catch (_) {
            /* ignore */
        }
    };

    const next = () => {
        if (index < questions.length - 1) {
            setIndex((i) => i + 1);
        } else {
            setCorrectShown(false);
            setIndex(index); // stay
            setCompleted(true);
        }
    };

    if (completed) {
        const displayXp = correctCount * 10 + (awardedXp ?? 0);
        return (
            <LessonComplete
                correct={correctCount}
                total={questions.length}
                displayXp={displayXp}
                onExit={onExit}
            />
        );
    }

    const correctAnswerText = mcMode
        ? q.options?.find((o) => o.is_correct)?.text || ""
        : (q.options || [])
              .filter((o) => o.is_correct)
              .map((o) => o.text)
              .join(" ");

    return (
        <div className="flex min-h-screen flex-col gap-5">
            <ProgressBar
                value={correctCount + incorrectCount}
                total={totalNeeded}
                onExit={onExit}
                hearts={hearts}
            />

            {noHearts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
                        <div className="mb-2 text-2xl font-bold text-rose-600">
                            Немає сердець
                        </div>
                        <p className="mb-4 text-gray-700">
                            Поповни серця, щоб продовжити урок.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={onExit}
                                className="rounded-full bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                            >
                                Вийти
                            </button>
                            <button
                                onClick={async () => {
                                    setRefillMsg("");
                                    try {
                                        const res =
                                            await ProgressService.refillHearts();
                                        const heartsVal =
                                            res?.data?.hearts ?? res?.hearts;
                                        if (typeof heartsVal === "number") {
                                            setHearts(heartsVal);
                                            if (heartsVal > 0) {
                                                setNoHearts(false);
                                                setRefillMsg("");
                                                toast?.success?.(
                                                    "Життя відновлено!"
                                                );
                                                return;
                                            }
                                        }
                                        setRefillMsg(
                                            "Не вдалося поповнити серця."
                                        );
                                        toast?.error?.(
                                            "Не вдалося поповнити серця."
                                        );
                                    } catch (e) {
                                        const status = e?.response?.status;
                                        const msg =
                                            e?.response?.data?.message || "";
                                        if (
                                            status === 400 &&
                                            msg.includes("Not enough points")
                                        ) {
                                            setRefillMsg(
                                                "Недостатньо очок для поповнення."
                                            );
                                            toast?.error?.(
                                                "Недостатньо очок для поповнення."
                                            );
                                        } else if (
                                            status === 400 &&
                                            msg.includes(
                                                "Hearts are already full"
                                            )
                                        ) {
                                            setRefillMsg("Серця вже повні.");
                                            toast?.info?.("Серця вже повні.");
                                        } else {
                                            setRefillMsg(
                                                "Сталася помилка. Спробуй ще раз."
                                            );
                                            toast?.error?.(
                                                "Сталася помилка. Спробуй ще раз."
                                            );
                                        }
                                    }
                                }}
                                className="rounded-full bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600"
                            >
                                Поповнити
                            </button>
                        </div>
                        {refillMsg && (
                            <div className="mt-3 text-sm text-rose-600">
                                {refillMsg}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!noHearts && mcMode ? (
                <MultipleChoice
                    question={q}
                    selected={selected}
                    setSelected={setSelected}
                />
            ) : !noHearts ? (
                <WriteIn
                    question={q}
                    selectedIndices={selectedIndices}
                    setSelectedIndices={setSelectedIndices}
                />
            ) : (
                <div className="flex grow items-center justify-center text-gray-500">
                    Серця закінчилися
                </div>
            )}

            <CheckPanel
                isAnswerSelected={
                    mcMode ? selected !== null : selectedIndices.length > 0
                }
                isAnswerCorrect={isCorrect}
                correctAnswerShown={correctShown}
                correctAnswer={correctAnswerText}
                onCheckAnswer={noHearts ? () => {} : checkAnswer}
                onFinish={next}
                onSkip={() => {
                    setIsCorrect(false);
                    setCorrectShown(true);
                }}
            />
        </div>
    );
};

export default DuoLesson;
