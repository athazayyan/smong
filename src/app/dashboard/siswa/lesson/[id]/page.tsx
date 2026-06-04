import { notFound } from "next/navigation";
import { lessonNodes, mockActivities } from "@/features/student-learning/data/mockData";
import { LessonClient } from "./LessonClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;

  const node = lessonNodes.find((n) => n.id === id);
  if (!node) return notFound();

  const activityId = node.activityIds[0];
  const activity = mockActivities.find((a) => a.id === activityId);
  if (!activity) return notFound();

  return <LessonClient node={node} activity={activity} />;
}

export function generateStaticParams() {
  return lessonNodes.map((n) => ({ id: n.id }));
}
