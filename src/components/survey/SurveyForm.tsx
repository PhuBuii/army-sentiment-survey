"use client";

import React, { useState, useEffect, useRef } from "react";
import { submitSurveyAndAnalyze } from "@/app/actions/survey-actions";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Eye,
  Send,
  CheckCircle2,
  Edit3,
  Brain,
  Cpu,
  Lock,
  Sparkles,
} from "lucide-react";

type Question = { id: string; content: string };
type Soldier = { id: string; full_name: string; unit: string };
interface SurveyFormProps { soldier: Soldier; questions: Question[] }

// ── Step: Answering questions ─────────────────────────────────────────────────
type Phase = "answering" | "preview" | "analyzing" | "success";

const AI_STEPS = [
  { icon: Brain,    label: "Đang mã hoá câu trả lời...",       duration: 1800 },
  { icon: Cpu,      label: "AI đang phân tích tâm lý...",       duration: 2400 },
  { icon: Sparkles, label: "Tổng hợp báo cáo tư tưởng...",     duration: 1800 },
  { icon: Lock,     label: "Mã hoá & ghi nhận vào hệ thống...", duration: 1000 },
];

// ── Animated dot loader ───────────────────────────────────────────────────────
function DotPulse() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#a3e635] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-[#84cc16] dark:to-[#a3e635] rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_8px_#a3e635]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function SurveyForm({ soldier, questions }: SurveyFormProps) {
  const [phase, setPhase]         = useState<Phase>("answering");
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [errorStr, setErrorStr]   = useState("");
  const [aiStep, setAiStep]       = useState(0);
  const [aiDone, setAiDone]       = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError]   = useState("");
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  // auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [answers, currentStep]);

  // auto-focus textarea when step changes
  useEffect(() => {
    if (phase === "answering") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [currentStep, phase]);

  // run AI step sequence when phase = analyzing
  useEffect(() => {
    if (phase !== "analyzing") return;
    let idx = 0;
    const run = () => {
      if (idx >= AI_STEPS.length) { setAiDone(true); return; }
      setAiStep(idx);
      setTimeout(() => { idx++; run(); }, AI_STEPS[idx]?.duration ?? 1000);
    };
    run();
  }, [phase]);

  const currentQ   = localQuestions[currentStep];
  const currentAns = answers[currentQ.id] ?? "";
  const canNext    = currentAns.trim().length > 0;
  const answeredCount = Object.values(answers).filter(v => v.trim()).length;

  const handleNext = async () => {
    if (!canNext || isChecking) return;
    setIsChecking(true);
    setApiError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQ.content, answer: currentAns }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Bạn thao tác quá nhanh! Vui lòng chậm lại.");
        throw new Error("Lỗi khi kết nối tới Trợ lý AI.");
      }
      const data = await res.json();
      if (data.needsFollowUp && data.followUpQuestion) {
        const newQ = { id: `followup-${Date.now()}`, content: `🔍 AI Trợ lý: ${data.followUpQuestion}` };
        const updatedQs = [...localQuestions];
        updatedQs.splice(currentStep + 1, 0, newQ);
        setLocalQuestions(updatedQs);
      }
      setCurrentStep(p => Math.min(p + 1, localQuestions.length - 1));
    } catch (err: any) {
      setApiError(err.message || "Lỗi hệ thống.");
    } finally {
      setIsChecking(false);
    }
  };

  const handlePrev  = () => setCurrentStep(p => Math.max(p - 1, 0));

  const goPreview = () => setPhase("preview");
  const goBack    = () => setPhase("answering");

  const handleSubmit = async () => {
    setPhase("analyzing");
    setAiDone(false);
    setErrorStr("");

    const payload = localQuestions.map(q => ({ question: q.content, answer: answers[q.id] ?? "" }));
    const result  = await submitSurveyAndAnalyze(soldier.id, payload);

    // wait until AI animation finishes before showing result
    const check = () => {
      if (aiDone || result.error) {
        if (result.error) { setErrorStr(result.error); setPhase("preview"); }
        else setPhase("success");
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: SUCCESS
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "success") {
    return (
      <div className="rounded-2xl overflow-hidden border border-emerald-200 dark:border-[#a3e635]/30 bg-white dark:bg-[#0a0f08] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center px-8 py-16 gap-6">
          {/* Success icon with ring animation */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 dark:bg-[#a3e635]/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-emerald-50 dark:bg-[#1a2315] border-2 border-emerald-400 dark:border-[#a3e635] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] dark:shadow-[0_0_30px_rgba(163,230,53,0.3)]">
              <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-[#a3e635]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Đã hoàn thành!
            </h2>
            <p className="text-emerald-600 dark:text-[#a3e635] text-sm font-mono tracking-widest uppercase">
              ✓ Dữ liệu đã được lưu an toàn
            </p>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm leading-relaxed">
            Đồng chí <span className="font-semibold text-slate-800 dark:text-white">{soldier.full_name}</span> đã hoàn thành khảo sát. Hệ thống AI đã phân tích và ghi nhận kết quả. Chúc đồng chí hoàn thành tốt nhiệm vụ!
          </p>

          {/* Stats */}
          <div className="flex gap-6 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-[#a3e635]">{localQuestions.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">Câu hỏi</div>
            </div>
            <div className="w-px bg-slate-200 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-[#a3e635]">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Hoàn thành</div>
            </div>
            <div className="w-px bg-slate-200 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-[#a3e635]">AI</div>
              <div className="text-xs text-slate-400 mt-0.5">Đã phân tích</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: ANALYZING
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "analyzing") {
    const step = AI_STEPS[Math.min(aiStep, AI_STEPS.length - 1)];
    const StepIcon = step.icon;
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#4d6639]/60 bg-white dark:bg-[#0a0f08] shadow-2xl animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center px-8 py-16 gap-8">
          {/* Animated brain icon */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-emerald-400/10 dark:bg-[#a3e635]/10 animate-pulse" />
            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-[#1a2315] border border-slate-200 dark:border-[#a3e635]/30 flex items-center justify-center shadow-lg">
              <StepIcon className="w-10 h-10 text-emerald-600 dark:text-[#a3e635] animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-widest font-mono">AI đang xử lý</p>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-3 justify-center">
              {step.label} <DotPulse />
            </h3>
          </div>

          {/* Step indicators */}
          <div className="flex gap-3 items-center">
            {AI_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${i <= aiStep ? "opacity-100" : "opacity-25"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500 ${i < aiStep ? "bg-emerald-500 dark:bg-[#a3e635] border-emerald-500 dark:border-[#a3e635]" : i === aiStep ? "bg-emerald-50 dark:bg-[#1a2315] border-emerald-400 dark:border-[#a3e635] shadow-[0_0_12px_rgba(16,185,129,0.4)] dark:shadow-[0_0_12px_#a3e635]" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10"}`}>
                    {i < aiStep
                      ? <CheckCircle2 className="w-4 h-4 text-white dark:text-[#0a0f08]" />
                      : <Icon className={`w-4 h-4 ${i === aiStep ? "text-emerald-600 dark:text-[#a3e635]" : "text-slate-400 dark:text-slate-600"}`} />
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full max-w-xs">
            <ProgressBar value={aiStep + 1} total={AI_STEPS.length} />
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            Vui lòng không đóng trang này...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: PREVIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "preview") {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#4d6639]/60 bg-white dark:bg-[#0a0f08] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-[#1a2315]/60 px-6 py-5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center">
              <Eye className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white text-base">Xem lại trước khi nộp</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Đồng chí {soldier.full_name} &middot; {soldier.unit}</p>
            </div>
          </div>
        </div>

        {/* Answer list */}
        <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {localQuestions.map((q, i) => (
            <div key={q.id} className="group rounded-xl border border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-white/4 p-4 hover:border-emerald-200 dark:hover:border-[#a3e635]/30 transition-colors duration-200">
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-[#a3e635]/15 text-emerald-700 dark:text-[#a3e635] text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1 leading-normal">{q.content}</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed break-words">
                    {answers[q.id] || <span className="text-red-400 italic">Chưa trả lời</span>}
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentStep(i); setPhase("answering"); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Sửa câu này"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {errorStr && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm text-center">
            {errorStr}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0f08]">
          <button
            onClick={goBack}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Sửa lại
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[#a3e635] dark:hover:bg-[#84cc16] text-white dark:text-[#0a0f08] font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-200 dark:shadow-[#a3e635]/20"
          >
            <Send className="w-4 h-4" /> Nộp bài & Phân tích AI
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: ANSWERING
  // ─────────────────────────────────────────────────────────────────────────
  const isLastStep = currentStep === localQuestions.length - 1;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#4d6639]/60 bg-white dark:bg-[#0a0f08] shadow-2xl">
      {/* ── Top progress bar ── */}
      <div className="px-0">
        <ProgressBar value={answeredCount} total={localQuestions.length} />
      </div>

      {/* ── Header ── */}
      <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-[#0d1409]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#a3e635]/15 border border-emerald-100 dark:border-[#a3e635]/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-[#a3e635]" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{soldier.full_name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px] sm:max-w-xs">{soldier.unit}</p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[50%]">
            {localQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-5 h-2.5 bg-emerald-500 dark:bg-[#a3e635]"
                    : answers[localQuestions[i].id]?.trim()
                    ? "w-2.5 h-2.5 bg-emerald-300 dark:bg-[#a3e635]/50"
                    : "w-2.5 h-2.5 bg-slate-200 dark:bg-white/15"
                }`}
                title={`Câu ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Question area ── */}
      <div
        key={currentStep}
        className="px-5 sm:px-8 pt-7 pb-5 animate-in fade-in slide-in-from-right-4 duration-300"
      >
        {/* Step label */}
        <p className="text-xs font-semibold text-emerald-600 dark:text-[#a3e635] uppercase tracking-widest mb-3 flex items-center gap-2 font-mono">
          <span className="inline-flex w-5 h-5 rounded-full bg-emerald-50 dark:bg-[#a3e635]/15 items-center justify-center text-[10px] font-bold">{currentStep + 1}</span>
          Câu hỏi {currentStep + 1} / {localQuestions.length}
        </p>

        {/* Question text */}
        <h3 className={`text-lg sm:text-xl font-semibold leading-relaxed mb-6 ${currentQ.id.startsWith('followup') ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
          {currentQ.content}
        </h3>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#111]/80 text-slate-800 dark:text-slate-100 text-base placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-[#a3e635]/60 focus:border-emerald-400 dark:focus:border-[#a3e635]/60 transition-all duration-200 py-3.5 px-4 leading-relaxed shadow-inner font-[inherit]"
            placeholder="Nhập câu trả lời của đồng chí tại đây..."
            value={currentAns}
            onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey && canNext) {
                if (isLastStep) goPreview(); else handleNext();
              }
            }}
          />
          {currentAns.trim().length > 0 && (
            <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-300 dark:text-slate-600 font-mono select-none">
              {currentAns.length} ký tự
            </span>
          )}
        </div>

        {apiError && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
            {apiError}
          </p>
        )}
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-2 font-mono flex items-center justify-between">
          <span>Ctrl + Enter để sang bước tiếp theo</span>
          {isChecking && <span className="flex items-center gap-1 text-emerald-600 dark:text-[#a3e635]"><DotPulse /> AI đang phân tích...</span>}
        </p>
      </div>

      {/* ── Footer navigation ── */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-t border-slate-100 dark:border-white/8 bg-slate-50/40 dark:bg-[#0a0f08]/60 gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-2">
          {/* Answered count badge */}
          <span className="hidden sm:flex text-xs text-slate-400 dark:text-slate-500 items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-[#a3e635]" />
            {answeredCount}/{localQuestions.length} đã trả lời
          </span>

          {isLastStep ? (
            <button
              onClick={isChecking ? undefined : goPreview}
              disabled={!canNext || isChecking}
              className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-[#a3e635] dark:hover:bg-[#84cc16] text-white dark:text-[#0a0f08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-200 dark:shadow-[#a3e635]/20"
            >
              <Eye className="w-4 h-4" /> Xem lại & Nộp bài
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canNext || isChecking}
              className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-[#a3e635] dark:hover:bg-[#84cc16] text-white dark:text-[#0a0f08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[130px] justify-center"
            >
              {isChecking ? <DotPulse /> : <><Sparkles className="w-4 h-4" /> Tiếp theo <ArrowRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
