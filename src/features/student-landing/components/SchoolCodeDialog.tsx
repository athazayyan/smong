"use client";

import React, { useState } from "react";
import { X, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

interface SchoolCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SchoolCodeDialog({ isOpen, onClose }: SchoolCodeDialogProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus("checking");
    setMessage("Memeriksa kode...");

    // Mock verification
    setTimeout(() => {
      if (code.toUpperCase() === "SMG-7K2P") {
        setStatus("success");
        setMessage("Kode cocok. Progresmu sekarang tersambung dengan sekolah.");
      } else {
        setStatus("error");
        setMessage("Kode belum ditemukan. Cek lagi kode dari gurumu.");
      }
    }, 1500);
  };

  const handleClose = () => {
    setStatus("idle");
    setCode("");
    setMessage("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-code-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6 sm:p-8">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <KeyRound className="w-8 h-8" />
          </div>

          <h2 id="school-code-dialog-title" className="text-2xl font-bold text-center text-slate-800 mb-2">
            Masukkan Kode Sekolah
          </h2>
          <p className="text-center text-slate-500 mb-8 px-4">
            Sambungkan progres belajarmu dengan gurumu lewat kode ini.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: SMG-7K2P"
                disabled={status === "checking" || status === "success"}
                className={`w-full text-center text-2xl font-bold tracking-widest p-4 rounded-xl border-2 transition-all outline-none ${
                  status === "error" 
                    ? "border-red-300 bg-red-50 text-red-900 placeholder:text-red-300"
                    : status === "success"
                    ? "border-teal-300 bg-teal-50 text-teal-900 placeholder:text-teal-300"
                    : "border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-slate-800 placeholder:text-slate-300"
                }`}
              />
            </div>

            {message && (
              <div className={`flex items-start gap-2 p-4 rounded-xl text-sm font-medium ${
                status === "success" ? "bg-teal-50 text-teal-800" :
                status === "error" ? "bg-red-50 text-red-800" :
                "bg-blue-50 text-blue-800"
              }`}>
                {status === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                {status === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "checking" || status === "success" || !code.trim()}
              className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {status === "checking" ? "Memeriksa..." : 
               status === "success" ? "Tersambung!" : 
               "Cek Kode"}
            </button>
          </form>
          
          {status === "idle" && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Belum punya kode? Kamu <span className="font-semibold text-slate-700">tetap bisa belajar</span> tanpa kode.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
