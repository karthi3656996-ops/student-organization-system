"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (memberData: RegisteredMemberData) => void;
}

export interface MemberRegistrationPayload {
  name: string;
  studentId: string;
  department: string;
  email: string;
}

export interface RegisteredMemberData extends MemberRegistrationPayload {
  id?: string;
  status?: string;
  memberQrToken?: string;
}

interface FormErrors {
  name?: string;
  studentId?: string;
  department?: string;
  email?: string;
}

type SubmissionState = "idle" | "submitting" | "success" | "error";

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<MemberRegistrationPayload>({
    name: "",
    studentId: "",
    department: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [registeredMember, setRegisteredMember] = useState<RegisteredMemberData | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    // 1. Full Name validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      nextErrors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Full name must be at least 2 characters.";
    }

    // 2. Student ID validation
    const trimmedStudentId = formData.studentId.trim();
    if (!trimmedStudentId) {
      nextErrors.studentId = "Student ID is required.";
    } else if (trimmedStudentId.length < 3) {
      nextErrors.studentId = "Student ID must be at least 3 characters.";
    }

    // 3. Department validation
    const trimmedDept = formData.department.trim();
    if (!trimmedDept) {
      nextErrors.department = "Department is required.";
    }

    // 4. Email validation
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address (e.g., student@university.edu).";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (field: keyof MemberRegistrationPayload) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field-level error on change if present
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null);
      setApiNotice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    setApiNotice(null);

    const payload: MemberRegistrationPayload = {
      name: formData.name.trim(),
      studentId: formData.studentId.trim(),
      department: formData.department.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    let isSuccess = false;

    try {
      // Connect to the registration endpoint
      const response = await fetch("/api/members/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      // Handle backend status
      if (response.ok && data?.success && data?.member) {
        isSuccess = true;
        setStatus("success");
        setRegisteredMember(data.member);
        if (onSuccess) onSuccess(data.member);
      } else {
        setStatus("error");
        setErrorMessage(
          data?.message || `Registration failed with status code ${response.status}.`
        );
      }
    } catch (err: unknown) {
      // Network failure or offline server
      setStatus("error");
      const errText = err instanceof Error ? err.message : "Unable to connect to the registration server.";
      setErrorMessage(errText);
    } finally {
      // Always guarantee loading state exits 'submitting'
      setStatus((prev) => (prev === "submitting" ? (isSuccess ? "success" : "error") : prev));
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      studentId: "",
      department: "",
      email: "",
    });
    setErrors({});
    setStatus("idle");
    setErrorMessage(null);
    setApiNotice(null);
    setRegisteredMember(null);
  };

  const handleClose = () => {
    if (status === "submitting") return;
    setStatus("idle");
    setErrorMessage(null);
    setApiNotice(null);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join Skyline Student Association"
      description="Register your membership for the 2025–2026 academic year."
      maxWidth="md"
    >
      {/* SUCCESS STATE */}
      {status === "success" && registeredMember && (
        <div className="py-2 space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">
                Membership Registration Confirmed!
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Welcome to Skyline! Your digital membership profile has been created with verified benefits.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Full Name:</span>
              <span className="font-semibold text-white">{registeredMember.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Student ID:</span>
              <span className="font-mono text-indigo-300">{registeredMember.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="text-white">{registeredMember.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-white">{registeredMember.email}</span>
            </div>
            {registeredMember.status && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">Membership Status:</span>
                <Badge variant="success">{registeredMember.status}</Badge>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Register Another Member
            </Button>
            <Button variant="gradient" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* REGISTRATION FORM (IDLE, SUBMITTING, ERROR) */}
      {status !== "success" && (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {/* Membership Benefits Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Includes $15 off Gala tickets & Merch discounts</span>
            </div>
            <Badge variant="primary">$15 / Year</Badge>
          </div>

          {/* Error Banner */}
          {status === "error" && errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs space-y-1.5"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="font-semibold text-rose-300">{errorMessage}</div>
              </div>
              {apiNotice && (
                <div className="pl-6 text-[11px] text-slate-300/90 leading-relaxed border-t border-rose-800/40 pt-1.5 mt-1">
                  <span className="font-semibold text-indigo-300">Developer Note: </span>
                  {apiNotice}
                </div>
              )}
            </div>
          )}

          {/* Form Field 1: Full Name */}
          <div>
            <Input
              ref={nameInputRef}
              id="member-fullname"
              label="Full Name *"
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={handleInputChange("name")}
              error={errors.name}
              disabled={status === "submitting"}
              autoComplete="name"
              required
            />
          </div>

          {/* Form Field 2: Student ID */}
          <div>
            <Input
              id="member-studentid"
              label="Student ID *"
              placeholder="e.g. 1NT23CS042"
              value={formData.studentId}
              onChange={handleInputChange("studentId")}
              error={errors.studentId}
              disabled={status === "submitting"}
              autoComplete="off"
              required
            />
          </div>

          {/* Form Field 3: Department */}
          <div>
            <Input
              id="member-department"
              label="Department *"
              placeholder="e.g. Computer Science & Engineering"
              value={formData.department}
              onChange={handleInputChange("department")}
              error={errors.department}
              disabled={status === "submitting"}
              autoComplete="organization-title"
              required
            />
          </div>

          {/* Form Field 4: Email Address */}
          <div>
            <Input
              id="member-email"
              type="email"
              label="Email Address *"
              placeholder="e.g. alex.rivera@university.edu"
              value={formData.email}
              onChange={handleInputChange("email")}
              error={errors.email}
              disabled={status === "submitting"}
              autoComplete="email"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={status === "submitting"}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="gradient"
              size="md"
              isLoading={status === "submitting"}
              className="gap-2"
            >
              Submit Membership
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
