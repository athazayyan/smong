import React from "react";
import { StudentNavbar } from "@/features/student-landing/components/StudentNavbar";
import { mockStudentLandingState } from "@/features/student-landing/data/mock-landing";

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use mock data for navbar state across the siswa section
  const { navbarItems, schoolSyncStatus, school } = mockStudentLandingState;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <StudentNavbar 
        items={navbarItems} 
        schoolSyncStatus={schoolSyncStatus} 
        schoolName={school?.name} 
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
