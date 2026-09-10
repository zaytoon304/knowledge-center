"use client";
import { Lock } from "lucide-react";
import { useAuth, type CoordinatorProfile } from "@/contexts/AuthContext";

// يغلّف كل صفحات /ai-tools/* تلقائياً — نقطة تحكم واحدة بدل تعديل كل أداة على حدة.
// يمنع فقط منسّقاً معيّناً اتخذ الأدمن قرار إيقافه صراحة (aiDisabled)؛ أي زائر/طالب/منسّق
// آخر/أدمن يفتح هذي الصفحات عادي تماماً كما كانت — صفر تغيير بالسلوك لغيره.
export default function AiToolsLayout({ children }: { children: React.ReactNode }) {
  const { user, isCoordinator } = useAuth();
  const blocked = isCoordinator && Boolean((user as CoordinatorProfile)?.aiDisabled);

  if (blocked) {
    return (
      <div className="max-w-md mx-auto mt-16 card p-8 text-center text-gray-400">
        <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-semibold text-gray-600">🛠️ هذي الأداة قيد الصيانة حالياً</p>
        <p className="text-sm mt-1">جرّب مرة أخرى لاحقاً</p>
      </div>
    );
  }
  return <>{children}</>;
}
