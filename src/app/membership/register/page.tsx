"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MembershipRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    graduationYear: "2028",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    name: string;
    email: string;
    studentId: string;
    department: string;
    status: string;
    memberQrToken: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) return "Full Name must be at least 2 characters.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) return "A valid university email is required.";
    if (!formData.studentId.trim() || formData.studentId.trim().length < 3) return "Student ID must be at least 3 characters.";
    if (!formData.department.trim()) return "Department is required.";
    
    const year = parseInt(formData.graduationYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear || year > currentYear + 8) {
      return `Please enter a valid graduation year (between ${currentYear} and ${currentYear + 8}).`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/members/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          studentId: formData.studentId.trim(),
          department: formData.department.trim(),
          graduationYear: parseInt(formData.graduationYear, 10),
          phoneNumber: formData.phoneNumber.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register member.");
      }

      setSuccessData(data.member);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F0F7FF] text-slate-800 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 border border-blue-200 px-3 py-1 rounded-full">
            Official Registration
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-8">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center mb-3 shadow-md shadow-blue-600/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Skyline Association Membership
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Join the student network to unlock member-tier event discounts, exclusive merch, and club voting rights.
            </p>
          </div>

          <div className="pt-6">
            {successData ? (
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Welcome, {successData.name}!</h2>
                  <p className="text-slate-500 text-xs mt-1">Your membership has been registered and verified.</p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-blue-100/80">
                    <span className="text-slate-500">Student ID:</span>
                    <span className="font-mono font-bold text-blue-800">{successData.studentId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100/80">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800">{successData.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100/80">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {successData.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Digital Pass Token:</span>
                    <span className="font-mono text-[11px] text-blue-700 flex items-center gap-1 font-semibold">
                      <QrCode className="w-3.5 h-3.5" />
                      {successData.memberQrToken.substring(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    onClick={() => {
                      setSuccessData(null);
                      setFormData({
                        name: "",
                        email: "",
                        studentId: "",
                        department: "",
                        graduationYear: "2028",
                        phoneNumber: "",
                      });
                    }}
                  >
                    Register Another Member
                  </Button>
                  <Link href="/student/login" className="w-full">
                    <Button variant="outline" className="w-full text-xs font-semibold">
                      Sign In to Student Portal →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                      University Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="alex.m@skyline.edu"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentId" className="block text-xs font-semibold text-slate-700 mb-1">
                      Student ID *
                    </label>
                    <Input
                      id="studentId"
                      name="studentId"
                      placeholder="e.g. STU-2026-089"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-xs font-semibold text-slate-700 mb-1">
                      Department / Major *
                    </label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g. Computer Science"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="graduationYear" className="block text-xs font-semibold text-slate-700 mb-1">
                      Graduation Year *
                    </label>
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      placeholder="e.g. 2028"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-600/30"
                    disabled={loading}
                  >
                    {loading ? "Recording Membership..." : "Submit Registration"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
