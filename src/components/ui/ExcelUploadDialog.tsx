"use client";

import React, { useCallback, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { DownloadCloud, FileSpreadsheet, Loader2, UploadCloud, X } from "lucide-react";

interface ExcelUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
  title: string;
  description: string;
  sampleFileName: string;
  sampleFileUrl: string;
}

export function ExcelUploadDialog({
  isOpen,
  onOpenChange,
  onUpload,
  isUploading,
  title,
  description,
  sampleFileName,
  sampleFileUrl,
}: ExcelUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setSelectedFile(file);
      } else {
        alert("Vui lòng chọn file Excel đính dạng .xlsx hoặc .xls");
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setSelectedFile(file);
      } else {
        alert("Vui lòng chọn file Excel định dạng .xlsx hoặc .xls");
      }
    }
  };

  const handleConfirmUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  // Reset file when dialog closed
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setDragActive(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={isUploading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl dark:bg-[#0d1109] dark:border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Sample Download Section */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Excel Mẫu</p>
                <p className="text-[10px] text-slate-500">{sampleFileName}</p>
              </div>
            </div>
            <a
              href={sampleFileUrl}
              download={sampleFileName}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <DownloadCloud className="w-3.5 h-3.5" /> Tải mẫu
            </a>
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 text-center
              ${dragActive ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-white/15 bg-slate-50/50 dark:bg-white/5"}
              ${selectedFile ? "border-solid border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10" : "hover:border-slate-300 dark:hover:border-white/30 cursor-pointer"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleChange}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  disabled={isUploading}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Huỷ bỏ
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Kéo thả file vào đây hoặc <span className="text-emerald-600 dark:text-emerald-400">chọn file</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Hỗ trợ .xlsx, .xls</p>
                </div>
              </div>
            )}
            
            {dragActive && (
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none border-2 border-emerald-500 border-dashed">
                <p className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">Thả file ngay!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 dark:border-white/10 dark:text-slate-300"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Huỷ
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-all shadow-md active:scale-[0.98]"
            onClick={handleConfirmUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {isUploading ? "Đang tải dữ liệu..." : "Bắt đầu cập nhật"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
