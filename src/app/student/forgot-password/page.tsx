"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, ShieldCheck } from "lucide-react";

export default function StudentForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 p-8">
        <Link
          href="/student/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-slate-900">Reset your password</h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Enter the email address associated with your Skyline account and we&apos;ll send recovery instructions.
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-900">Recovery request submitted</h3>
            <p className="text-xs text-emerald-700 mt-1">
              If an account exists for <strong className="font-semibold">{email}</strong>, password reset details have been routed to your registered address.
            </p>
            <div className="mt-4 pt-4 border-t border-emerald-100 text-[11px] text-slate-500">
              For immediate campus administrator assistance, contact:{" "}
              <a href="mailto:support@skyline.edu" className="text-blue-600 font-semibold underline">
                support@skyline.edu
              </a>
            </div>
            <Link
              href="/student/login"
              className="mt-5 inline-block w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@skyline.edu"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-blue-600/30 cursor-pointer"
            >
              Send Reset Instructions
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
