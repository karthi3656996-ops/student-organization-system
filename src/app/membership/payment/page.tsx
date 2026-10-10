"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MembershipPaymentPage() {
  // NOTE: Static read-only preview. Backend integration pending authentication.
  return (
    <div className="container mx-auto max-w-3xl py-12 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membership Status & Dues</CardTitle>
          <CardDescription>
            View your current membership payment status. (Frontend Preview - Database Integration Pending)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-medium text-gray-700">Current Status</span>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">PENDING_PAYMENT</Badge>
          </div>
          <div className="flex justify-between items-center border-b pb-4">
            <span className="font-medium text-gray-700">Outstanding Dues</span>
            <span className="font-bold text-xl">$50.00</span>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
            Payment processing is currently disabled because you must be authenticated to process a transaction securely.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Records of your past membership dues.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 italic text-center py-6">
            No payment records found or authentication missing.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
