"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnnouncementsPage() {
  // NOTE: Static read-only preview. Backend integration pending authentication.
  return (
    <div className="container mx-auto max-w-4xl py-12 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        {/* Admin controls would be rendered here conditionally if authorized */}
        <span className="text-sm text-gray-500 italic">Auth dependency pending</span>
      </div>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Welcome to Skyline Hackathon 2026!</CardTitle>
              <CardDescription>Published: Oct 10, 2026 by Admin</CardDescription>
            </div>
            <Badge variant="outline" className="text-red-700 bg-red-50">URGENT</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Please make sure you have submitted your membership registration forms! 
            All dues must be cleared by the end of the week.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>New Merchandise Available</CardTitle>
              <CardDescription>Published: Oct 9, 2026 by Merch Team</CardDescription>
            </div>
            <Badge variant="outline" className="text-blue-700 bg-blue-50">NORMAL</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Our latest 2026 organization hoodies are now available on the store page. 
            Active members get a 10% discount!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
