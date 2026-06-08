import React from "react";
import { StandaloneArSafetyLensPage } from "@/features/student-learning/components/activities/ar/StandaloneArSafetyLensPage";
import { standaloneArSafetyLensActivity } from "@/features/student-learning/data/arSafetyLensData";

export default function StudentArPage() {
  return <StandaloneArSafetyLensPage activity={standaloneArSafetyLensActivity} />;
}
