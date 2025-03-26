"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TeamDisplay from "@/components/TeamDisplay";

export default function TeamsPage() {
  return (
    <div className="flex flex-col min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Team Directory
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse through teams and find team members
          </p>
        </div>
        
        <Suspense fallback={<div>Loading team data...</div>}>
          <TeamDisplay />
        </Suspense>
      </div>
    </div>
  );
} 
