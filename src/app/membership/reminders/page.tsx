"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MembershipRemindersPage() {
  // NOTE: Static read-only preview. Backend integration pending authentication.
  return (
    <div className="container mx-auto max-w-2xl py-12 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Membership Reminders</h1>
      
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Action Required: Membership Dues</CardTitle>
              <CardDescription>Sent today</CardDescription>
            </div>
            <Badge variant="outline" className="text-yellow-700 bg-yellow-50">UNREAD</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Dear member, this is a reminder that your membership dues for the upcoming academic year are currently outstanding.
            Please complete your payment to activate your membership benefits.
          </p>
          <div className="pt-2">
            <Button variant="outline" className="mr-4">View Payment Details</Button>
            <span className="text-sm text-gray-500 italic">Database integration pending auth</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="opacity-70">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Welcome to Skyline SSO</CardTitle>
              <CardDescription>Sent 7 days ago</CardDescription>
            </div>
            <Badge variant="outline" className="text-gray-500">READ</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Welcome! Please complete your registration and pay your dues to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
