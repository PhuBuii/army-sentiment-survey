"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Chọn...", className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-4 text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-700 dark:text-slate-300 focus:border-emerald-500 dark:focus:border-emerald-400 shadow-sm flex items-center justify-between transition-colors"
      >
        <span className="truncate pr-2">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent py-1">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">Không có dữ liệu</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                      ${value === option.value 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
