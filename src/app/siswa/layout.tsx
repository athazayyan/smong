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
    <div className="min-h-screen overflow-x-clip bg-cream-50 pb-24 font-sans md:pb-0">
      <StudentNavbar 
        items={navbarItems} 
        schoolSyncStatus={schoolSyncStatus} 
        schoolName={school?.name} 
      />
      {children}
    </div>
  );
}
