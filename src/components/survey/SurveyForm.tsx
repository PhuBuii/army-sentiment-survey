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
  Bot,
  History,
  WifiOff,
} from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

type Question = { id: string; content: string; isFollowUp?: boolean; parentId?: string };
type Soldier = { id: string; full_name: string; unit: string };
interface SurveyFormProps { 
  soldier: Soldier; 
  questions: Question[];
  token?: string;
  isCompleted?: boolean;
  previousAnswers?: Record<string, string>;
}

// ── Step: Answering questions ─────────────────────────────────────────────────
type Phase = "answering" | "preview" | "analyzing" | "success";

const AI_STEPS = [
  { icon: Brain,    label: "Đang mã hoá câu trả lời",       duration: 1800 },
  { icon: Cpu,      label: "AI đang phân tích tâm lý",       duration: 2400 },
  { icon: Sparkles, label: "Tổng hợp báo cáo tư tưởng",     duration: 1800 },
  { icon: Lock,     label: "Mã hoá & ghi nhận vào hệ thống", duration: 1000 },
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
function ProgressBar({ value, total, color = "emerald" }: { value: number; total: number; color?: string }) {
  const pct = Math.round((value / total) * 100);
  const colorClass = color === "blue" 
    ? "bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
    : "bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-[#84cc16] dark:to-[#a3e635] shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_8px_#a3e635]";
    
  return (
    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function SurveyForm({ soldier, questions, token, isCompleted, previousAnswers }: SurveyFormProps) {
  const [phase, setPhase]         = useState<Phase>(isCompleted ? "preview" : "answering");
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers]     = useState<Record<string, string>>(previousAnswers || {});
  const [errorStr, setErrorStr]   = useState("");
  const [aiStep, setAiStep]       = useState(0);
  const [aiDone, setAiDone]       = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError]   = useState("");
  const [submissionResult, setSubmissionResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  const isOnline = useNetworkStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [lastCheckedAnswers, setLastCheckedAnswers] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Draft key for localStorage
  const draftKey = `survey_draft_${token || soldier.id}`;

  // Load draft on mount
  useEffect(() => {
    if (isCompleted) return;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const { answers: savedAnswers, questions: savedQuestions, step: savedStep, lastChecked: savedLastChecked } = JSON.parse(saved);
        if (savedAnswers) setAnswers(savedAnswers);
        if (savedQuestions) setLocalQuestions(savedQuestions);
        if (typeof savedStep === "number") setCurrentStep(savedStep);
        if (savedLastChecked) setLastCheckedAnswers(savedLastChecked);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, [draftKey, isCompleted]);

  // Save draft on changes
  useEffect(() => {
    if (isCompleted || phase !== "answering") return;
    const draft = {
      answers,
      questions: localQuestions,
      step: currentStep,
      lastChecked: lastCheckedAnswers,
      timestamp: Date.now()
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [answers, localQuestions, currentStep, draftKey, isCompleted, phase, lastCheckedAnswers]);

  // Network alert effect
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
    } else {
      // Keep alert for a bit after back online
      const timer = setTimeout(() => setShowOfflineAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [answers, currentStep]);

  // auto-focus textarea when step changes
  useEffect(() => {
    if (phase === "answering" && !isCompleted) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [currentStep, phase, isCompleted]);

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

  // Handle transition to success or error after AI animation AND API result
  useEffect(() => {
    if (phase !== "analyzing" || !submissionResult) return;

    const isFailed = submissionResult.error;
    
    if (aiDone || isFailed) {
      if (isFailed) {
        setErrorStr(submissionResult.error || "Hệ thống đang bận hoặc có lỗi xảy ra. Vui lòng thử lại sau.");
        setPhase("preview");
        setSubmissionResult(null); // Reset for retry
      } else {
        localStorage.removeItem(draftKey);
        setPhase("success");
      }
    }
  }, [phase, aiDone, submissionResult, draftKey]);

  const currentQ   = localQuestions[currentStep] || { id: "temp", content: "" };
  const currentAns = currentQ.id ? (answers[currentQ.id] ?? "") : "";
  const canNext    = currentAns.trim().length > 0;
  const answeredCount = Object.values(answers).filter(v => v.trim()).length;

  const handleNext = async () => {
    if (!canNext || isChecking) return;
    
    // Check if we already reached 2 follow-ups for the CURRENT system question
    // We find the last "system" question index
    let currentSystemQIndex = currentStep;
    while (currentSystemQIndex >= 0 && localQuestions[currentSystemQIndex].isFollowUp) {
      currentSystemQIndex--;
    }
    
    const followUpsForThisQ = localQuestions.slice(currentSystemQIndex + 1).filter(q => q.parentId === localQuestions[currentSystemQIndex].id);
    const followUpCount = followUpsForThisQ.length;

    // If current question IS a follow-up and we already have 2, or if current is system and we somehow have 2...
    // Actually, if we are at follow-up #2, we MUST go to next system question.
    const isCurrentFollowUp = localQuestions[currentStep].isFollowUp;
    
    if (!isOnline) {
      // Offline mode: just go to next if it's already there, otherwise we can't generate new ones
      if (currentStep < localQuestions.length - 1) {
        setCurrentStep(p => p + 1);
      } else {
        goPreview();
      }
      return;
    }

    // [OPTIMIZATION] Skip AI if next question already exists AND answer hasn't changed
    const hasNext = currentStep < localQuestions.length - 1;
    const answerHasntChanged = lastCheckedAnswers[currentQ.id] === currentAns;
    
    if (hasNext && answerHasntChanged) {
      setCurrentStep(p => p + 1);
      return;
    }

    setIsChecking(true);
    setApiError("");
    try {
      // Calculate how many follow-ups follow the current parent
      const currentParentId = isCurrentFollowUp ? localQuestions[currentStep].parentId : localQuestions[currentStep].id;
      
      // If we are re-checking due to an answer change, we should remove any existing follow-ups for this parent
      // that come immediately after the current step.
      if (!answerHasntChanged && hasNext) {
         // Identify which questions to remove: follow-ups belonging to currentParentId
         const updatedQs = [...localQuestions];
         let removeCount = 0;
         for (let i = currentStep + 1; i < localQuestions.length; i++) {
           if (localQuestions[i].parentId === currentParentId) {
             removeCount++;
           } else {
             break; // Stop at first non-followup or different parent
           }
         }
         if (removeCount > 0) {
           updatedQs.splice(currentStep + 1, removeCount);
           setLocalQuestions(updatedQs);
         }
      }

      const existingFollowUps = localQuestions.filter(q => q.parentId === currentParentId && localQuestions.indexOf(q) < currentStep).length;

      if (existingFollowUps < 2) {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            question: currentQ.content, 
            answer: currentAns,
            followUpCount: existingFollowUps // Pass current count to AI
          }),
        });
        
        if (!res.ok) {
          if (res.status === 429) throw new Error("Bạn thao tác quá nhanh! Vui lòng chậm lại.");
          throw new Error("Lỗi khi kết nối tới Trợ lý AI.");
        }
        
        const data = await res.json();
        if (data.needsFollowUp && data.followUpQuestion) {
          const newQ = { 
            id: `followup-${Date.now()}`, 
            content: data.followUpQuestion,
            isFollowUp: true,
            parentId: currentParentId
          };
          const updatedQs = [...localQuestions];
          updatedQs.splice(currentStep + 1, 0, newQ);
          setLocalQuestions(updatedQs);
        }
        
        // Record that this answer has been checked
        setLastCheckedAnswers(prev => ({ ...prev, [currentQ.id]: currentAns }));
      }
      
      if (currentStep < localQuestions.length - 1) {
        setCurrentStep(p => p + 1);
      } else {
        goPreview();
      }
    } catch (err: any) {
      console.error("AI Interview Error:", err);
      // If it's a capacity error (503/High Demand), just move forward silently to avoid blocking the survey
      if (err.message?.includes("503") || err.message?.includes("high demand")) {
         setCurrentStep(p => p + 1);
      } else {
         setApiError("Trợ lý AI đang bận, hệ thống sẽ chuyển sang câu hỏi tiếp theo.");
         setTimeout(() => setCurrentStep(p => p + 1), 1500);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Re-calculate currentStep safety
  useEffect(() => {
    if (currentStep >= localQuestions.length) {
      setCurrentStep(localQuestions.length - 1);
    }
  }, [localQuestions, currentStep]);

  const handlePrev  = () => setCurrentStep(p => Math.max(p - 1, 0));

  const goPreview = () => setPhase("preview");
  const goBack    = () => setPhase("answering");

  const handleSubmit = async () => {
    if (isCompleted) return;
    setPhase("analyzing");
    setAiDone(false);
    setErrorStr("");

    const payload = localQuestions.map(q => ({ question: q.content, answer: answers[q.id] ?? "" }));
    const result  = await submitSurveyAndAnalyze(soldier.id, payload);
    setSubmissionResult(result || { error: "Không nhận được phản hồi từ máy chủ." });
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
  // PHASE: PREVIEW (Also used for Read-Only Review)
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === "preview") {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#4d6639]/60 bg-white dark:bg-[#0a0f08] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-slate-100 dark:border-white/10 ${isCompleted ? 'bg-blue-50/50 dark:bg-blue-500/10' : 'bg-slate-50 dark:bg-[#1a2315]/60'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isCompleted ? 'bg-blue-100/50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/40' : 'bg-blue-50 dark:bg-blue-500/15 border-blue-100 dark:border-blue-500/30'}`}>
                {isCompleted ? <History className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" /> : <Eye className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-white text-base">
                  {isCompleted ? "Xem lại khảo sát cũ" : "Xem lại trước khi nộp"}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Đồng chí {soldier.full_name} &middot; {soldier.unit}</p>
              </div>
            </div>
            {isCompleted && (
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-200/50 dark:border-blue-500/30">
                <Lock size={12} /> Đã hoàn thành
              </span>
            )}
          </div>
        </div>

        {/* Answer list */}
        <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {localQuestions.map((q, i) => {
            const isAI = q.id.startsWith('followup');
            return (
              <div key={q.id} className={`group rounded-xl border p-4 transition-all duration-200 ${isCompleted ? 'border-blue-100 dark:border-blue-500/10 bg-blue-50/20 dark:bg-blue-500/5' : 'border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-white/4 hover:border-emerald-200 dark:hover:border-[#a3e635]/30'}`}>
                <div className="flex gap-3">
                  <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${isCompleted ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-[#a3e635]/15 text-emerald-700 dark:text-[#a3e635]'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isAI && <Bot size={13} className="text-amber-500 shrink-0" />}
                      <p className={`text-xs font-medium leading-normal ${isAI ? 'text-amber-600/80 dark:text-amber-400/80' : 'text-slate-400 dark:text-slate-500'}`}>
                        {q.content}
                      </p>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed break-words ${isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {answers[q.id] || <span className="text-red-400 italic">Chưa trả lời</span>}
                    </p>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => { setCurrentStep(i); setPhase("answering"); }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Sửa câu này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {errorStr && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm text-center">
            {errorStr}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0f08]">
          {isCompleted ? (
            <div className="w-full flex flex-col items-center gap-2 py-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Câu trả lời đã được ghi nhận vào hệ thống và không thể thay đổi</p>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <CheckCircle2 size={16} /> TRANSACTION COMPLETED
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE: ANSWERING
  // ─────────────────────────────────────────────────────────────────────────
  const isAI = currentQ.isFollowUp || currentQ.id.startsWith('followup');
  const isLastStep = currentStep === localQuestions.length - 1;

  return (
    <div className="relative">
      {/* ── Network Status Alert ── */}
      {showOfflineAlert && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500`}>
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md ${!isOnline ? 'bg-amber-50/90 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'}`}>
            {!isOnline ? (
              <>
                <div className="relative">
                  <WifiOff className="w-5 h-5 animate-pulse" />
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Chế độ ngoại tuyến</span>
                  <span className="text-[10px] opacity-80 font-medium">Tiến độ vẫn đang được tự động lưu vào máy</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-bold">Đã khôi phục kết nối</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#4d6639]/60 bg-white dark:bg-[#0a0f08] shadow-2xl">

      {/* ── Top progress bar ── */}
      <div className="px-0">
        <ProgressBar value={answeredCount} total={localQuestions.length} color={isCompleted ? "blue" : "emerald"} />
      </div>

      {/* ── Header ── */}
      <div className="px-4 sm:px-8 pt-5 pb-4 border-b border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-[#0d1409]/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl border flex items-center justify-center ${isCompleted ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-100 dark:border-blue-500/30' : 'bg-emerald-50 dark:bg-[#a3e635]/15 border-emerald-100 dark:border-[#a3e635]/30'}`}>
              <MessageSquare className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-[#a3e635]'}`} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight truncate">{soldier.full_name}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">{soldier.unit}</p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end max-w-[40%] sm:max-w-[50%]">
            {localQuestions.map((_, i) => (
              <button
                key={i}
                disabled={isCompleted}
                onClick={() => setCurrentStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? (isCompleted ? "w-4 h-2 sm:w-5 sm:h-2.5 bg-blue-500" : "w-4 h-2 sm:w-5 sm:h-2.5 bg-emerald-500 dark:bg-[#a3e635]")
                    : answers[localQuestions[i].id]?.trim()
                    ? (isCompleted ? "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-300 dark:bg-blue-500/50" : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-300 dark:bg-[#a3e635]/50")
                    : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-200 dark:bg-white/15"
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
        className="px-5 sm:px-8 pt-7 pb-5 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col min-h-[300px]"
      >
        {/* Step label */}
        <div className="flex flex-col mb-5">
          {isMounted && currentStep === 0 && (
            <span className="text-emerald-600 dark:text-[#a3e635] text-[15px] font-bold mb-3 animate-in fade-in slide-in-from-left-4 duration-700">
              {(() => {
                const hour = new Date().getHours();
                let timeGreeting = "Chúc đồng chí một ngày tốt lành";
                if (hour >= 5 && hour < 11) timeGreeting = "Chúc đồng chí buổi sáng huấn luyện tốt";
                else if (hour >= 11 && hour < 14) timeGreeting = "Chúc đồng chí nghỉ trưa thoải mái";
                else if (hour >= 14 && hour < 18) timeGreeting = "Chúc đồng chí buổi chiều năng lượng";
                else if (hour >= 18 || hour < 5) timeGreeting = "Chào đồng chí buổi tối";
                return `👋 ${timeGreeting}, đồng chí ${soldier.full_name}!`;
              })()}
            </span>
          )}
          <div className="flex items-center justify-between">
            <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 font-mono ${isCompleted ? 'text-blue-600' : 'text-emerald-600 dark:text-[#a3e635]'}`}>
              <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold ${isCompleted ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 dark:bg-[#a3e635]/15 text-emerald-600 dark:text-[#a3e635]'}`}>
                {currentStep + 1}
              </span>
              Câu hỏi {currentStep + 1} / {localQuestions.length}
            </p>
          {isAI && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-tight">
              <Bot size={13} /> Câu hỏi bổ sung
            </span>
          )}
          </div>
        </div>

        {/* Question text card */}
        <div className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 mb-5 sm:mb-6 ${isAI ? 'bg-amber-50/30 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/20 shadow-sm' : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 shadow-sm'}`}>
          <div className="absolute top-2 right-3 opacity-10 dark:opacity-5 hidden sm:block">
             <MessageSquare size={64} />
          </div>
          <h3 className={`relative z-10 text-lg sm:text-2xl font-bold leading-relaxed ${isAI ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
            {currentQ.content}
          </h3>
        </div>

        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            readOnly={isCompleted}
            rows={4}
            className={`w-full resize-none rounded-2xl border transition-all duration-300 py-4 px-5 leading-relaxed shadow-inner font-[inherit] text-lg ${
              isCompleted 
                ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                : "bg-slate-50 dark:bg-[#111]/80 border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 dark:focus:ring-[#a3e635]/20 focus:border-emerald-400 dark:focus:border-[#a3e635]/60"
            }`}
            placeholder={isCompleted ? "" : "Công việc và tâm tư của đồng chí hôm nay như thế nào?..."}
            value={currentAns}
            onChange={(e) => !isCompleted && setAnswers({ ...answers, [currentQ.id]: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey && canNext && !isCompleted) {
                if (isLastStep) goPreview(); else handleNext();
              }
            }}
          />
          {!isCompleted && currentAns.trim().length > 0 && (
            <span className="absolute bottom-3 right-4 text-[11px] text-slate-300 dark:text-slate-600 font-mono select-none">
              {currentAns.length} ký tự
            </span>
          )}
          {isCompleted && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
               <Lock size={120} />
            </div>
          )}
        </div>

        {!isCompleted && apiError && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
            {apiError}
          </p>
        )}
        
        {!isCompleted && (
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-3 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-[10px]">Enter</kbd> để tiếp tục</span>
            {isChecking && <span className="flex items-center gap-1 text-emerald-600 dark:text-[#a3e635]"><DotPulse /> AI đang phân tích dữ liệu...</span>}
          </p>
        )}
      </div>

      {/* ── Footer navigation ── */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-t border-slate-100 dark:border-white/8 bg-slate-50/40 dark:bg-[#0a0f08]/60 gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="p-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Quay lại</span>
        </button>

        <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
          {/* Answered count badge */}
          <span className="hidden lg:flex text-xs text-slate-400 dark:text-slate-500 items-center gap-1.5 mr-2">
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-blue-500' : 'text-emerald-500 dark:text-[#a3e635]'}`} />
            {isCompleted ? "Đã xem hết" : `${answeredCount}/${localQuestions.length} đã trả lời`}
          </span>

          {isLastStep || isCompleted ? (
            <button
              onClick={isChecking ? undefined : (isCompleted ? () => setPhase("preview") : goPreview)}
              className={`flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-md ${
                isCompleted 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" 
                  : "bg-emerald-600 hover:bg-emerald-700 dark:bg-[#a3e635] dark:hover:bg-[#84cc16] text-white dark:text-[#0a0f08] shadow-emerald-200 dark:shadow-[#a3e635]/20"
              }`}
            >
              <Eye className="w-4 h-4" /> {isCompleted ? "Xem tổng thể" : <><span className="hidden sm:inline">Xem lại & </span>Nộp bài</>}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canNext || isChecking}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-[#a3e635] dark:hover:bg-[#84cc16] text-white dark:text-[#0a0f08] disabled:opacity-40 disabled:cursor-not-allowed transition-all min-w-[120px] sm:min-w-[140px] justify-center shadow-md shadow-emerald-200 dark:shadow-[#a3e635]/20"
            >
              {isChecking ? <DotPulse /> : <><Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Tiếp theo</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
