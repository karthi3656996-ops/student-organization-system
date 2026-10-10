"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function MembershipRegisterPage() {
  const [formData, setFormData] = useState({
    studentId: "",
    department: "",
    graduationYear: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.studentId.trim()) return "Student ID is required.";
    if (!formData.department.trim()) return "Department is required.";
    if (!formData.graduationYear.trim()) return "Graduation Year is required.";
    const year = parseInt(formData.graduationYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear || year > currentYear + 6) {
      return "Please enter a valid graduation year.";
    }
    if (!formData.phoneNumber.trim()) return "Phone Number is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // TODO: Connect to backend Server Action when Authentication is available.
    // We are simulating a server request here for frontend completeness.
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // NOTE: We do not claim this was saved to the database.
      setError("Backend integration is pending authentication dependency. Form data is valid but was not saved.");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Membership Registration</CardTitle>
          <CardDescription>
            Join the Skyline Student Organization. (Frontend Preview - Database Integration Pending)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium mb-1">
                Student ID
              </label>
              <Input
                id="studentId"
                name="studentId"
                placeholder="e.g. NMIT12345"
                value={formData.studentId}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium mb-1">
                Department
              </label>
              <Input
                id="department"
                name="department"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="graduationYear" className="block text-sm font-medium mb-1">
                Graduation Year
              </label>
              <Input
                id="graduationYear"
                name="graduationYear"
                type="number"
                placeholder="e.g. 2028"
                value={formData.graduationYear}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="e.g. 555-0123"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
            {success && <div className="text-sm text-green-500 bg-green-50 p-2 rounded">Registration request validated successfully!</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Validating..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
