"use client";

import React, { useState } from "react";
import { submitSurveyAndAnalyze } from "@/app/actions/survey-actions";
import { Loader2, ArrowRight, ArrowLeft, ShieldCheck, Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";

type Question = {
  id: string;
  content: string;
};

type Soldier = {
  id: string;
  full_name: string;
  unit: string;
};

interface SurveyFormProps {
  soldier: Soldier;
  questions: Question[];
}

export default function SurveyForm({ soldier, questions }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorStr, setErrorStr] = useState("");

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentQId = questions[currentStep].id;
  const canGoNext = !!answers[currentQId] && answers[currentQId].trim().length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorStr("");

    const payload = questions.map((q) => ({
      question: q.content,
      answer: answers[q.id] || "",
    }));

    const result = await submitSurveyAndAnalyze(soldier.id, payload);

    setIsSubmitting(false);

    if (result.error) {
      setErrorStr(result.error);
    } else if (result.success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl border border-[#a3e635]/30 bg-black/40 backdrop-blur-md duration-500 animate-in fade-in zoom-in-95 relative">
         <div className="absolute top-0 right-0 p-4 opacity-10">
           <ShieldCheck className="w-32 h-32 text-[#a3e635]" />
         </div>
        <div className="pt-16 pb-16 flex flex-col items-center justify-center text-center space-y-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-[#1a2315] border border-[#a3e635]/50 flex items-center justify-center animate-pulse glow-green">
            <ShieldCheck className="w-12 h-12 text-[#a3e635]" />
          </div>
          <div>
             <h2 className="text-3xl font-bold tracking-wider text-[#ecfccb] uppercase drop-shadow-md">Nhiệm Vụ Hoàn Tất</h2>
             <p className="text-[#a3e635] mt-1 font-mono text-sm tracking-widest">[DATA SECURED]</p>
          </div>
          <p className="text-zinc-400 max-w-sm px-4">
            Đồng chí <span className="font-bold text-zinc-200">{soldier.full_name}</span> đã hoàn thành khảo sát tư tưởng. Hệ thống đã đồng bộ. Chúc đồng chí công tác và huấn luyện tốt!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-2xl transition-all duration-300 border border-[#4d6639]/60 bg-black/60 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Military corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#a3e635] opacity-50 m-2"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#a3e635] opacity-50 m-2"></div>
      
      {/* Header */}
      <div className="bg-[#1a2315]/80 text-white pb-6 relative border-b border-[#2f3e26]">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#111]">
          <div 
            className="h-full bg-[#a3e635] transition-all duration-500 shadow-[0_0_10px_#a3e635]" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="flex flex-col pt-6 px-6">
           <div className="flex items-center justify-between mb-2">
              <p className="text-[#a3e635]/80 uppercase text-xs tracking-widest font-mono font-semibold">
                [ Tín hiệu mã hóa: {soldier.id.split('-')[0].toUpperCase()} ]
              </p>
              <div className="flex gap-1">
                 {[...Array(questions.length)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full ${i <= currentStep ? 'bg-[#a3e635] shadow-[0_0_5px_#a3e635]' : 'bg-zinc-800'}`} />
                 ))}
              </div>
           </div>
           
           <h1 className="text-[#ecfccb] text-xl font-medium tracking-wide">
             Giao diện Tương tác &middot; Đ/c {soldier.full_name}
           </h1>
           <p className="text-zinc-500 text-sm mt-1">{soldier.unit}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pt-10 pb-8 min-h-[300px] flex flex-col justify-center">
        <div 
          key={currentStep} 
          className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8"
        >
          <div className="flex gap-4">
             <Crosshair className="w-8 h-8 text-[#a3e635] shrink-0 mt-1 opacity-70" />
             <div>
                <p className="text-[#a3e635] text-xs font-mono mb-2 uppercase tracking-widest border-b border-[#a3e635]/20 inline-block pb-1">
                   Câu hỏi số {currentStep + 1}
                </p>
                <h3 className="text-2xl font-semibold text-zinc-100 leading-relaxed drop-shadow-md">
                  {questions[currentStep].content}
                </h3>
             </div>
          </div>
          
          <div className="pl-12">
            <Input
              id="answer"
              autoFocus
              className="text-lg py-7 px-4 bg-[#111] border-[#4d6639] text-[#ecfccb] focus-visible:ring-[#a3e635] focus-visible:border-[#a3e635] transition-all placeholder:text-zinc-700 font-medium rounded-lg"
              placeholder="Ghi nhận phản hồi..."
              value={answers[currentQId] || ""}
              onChange={(e) => setAnswers({ ...answers, [currentQId]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canGoNext) {
                  if (currentStep === questions.length - 1) handleSubmit();
                  else handleNext();
                }
              }}
            />
          </div>
        </div>

        {errorStr && (
          <p className="text-red-400 text-sm mt-6 text-center bg-red-900/20 p-2 rounded border border-red-900/50">{errorStr}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center bg-[#0a0f08] p-4 border-t border-[#2f3e26]">
        <button 
          className="px-4 py-2 flex items-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          onClick={handlePrev} 
          disabled={currentStep === 0 || isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Trở về
        </button>
        
        {currentStep === questions.length - 1 ? (
          <button 
            className="group relative px-6 py-2.5 outline-none disabled:opacity-50 flex items-center"
            disabled={!canGoNext || isSubmitting} 
            onClick={handleSubmit}
          >
             <div className="absolute inset-0 bg-[#a3e635] rounded skew-x-[-10deg] transition-all group-hover:bg-[#b8f553]" />
             <div className="relative font-bold text-[#1a2315] flex items-center">
               {isSubmitting ? (
                 <><Loader2 className="w-4 h-4 mr-2 animate-spin text-[#1a2315]" /> ĐANG TRUYỀN TẢI...</>
               ) : (
                 <><ShieldCheck className="w-4 h-4 mr-2" /> XÁC NHẬN HOÀN THÀNH</>
               )}
             </div>
          </button>
        ) : (
          <button 
            className="group relative px-6 py-2.5 outline-none disabled:opacity-50 flex items-center"
            disabled={!canGoNext || isSubmitting} 
            onClick={handleNext}
          >
             <div className="absolute inset-0 bg-transparent border-2 border-[#a3e635] rounded skew-x-[-10deg] transition-all group-hover:bg-[#a3e635]/10" />
             <div className="relative font-bold text-[#a3e635] flex items-center">
               BƯỚC TIẾP THEO <ArrowRight className="w-4 h-4 ml-2" />
             </div>
          </button>
        )}
      </div>
    </div>
  );
}
