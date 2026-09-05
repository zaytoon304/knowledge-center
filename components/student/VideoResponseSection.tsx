"use client";
import { useState, useEffect, useRef } from "react";
import { Video, Upload, Clock, CheckCircle2, XCircle, Film } from "lucide-react";
import { StudentProfile } from "@/contexts/AuthContext";
import {
  getPrompts, getResponses, submitVideoResponse, MAX_VIDEO_BYTES,
  type VideoPrompt, type VideoResponse,
} from "@/lib/videoResponses";

export default function VideoResponseSection({ student }: { student: StudentProfile }) {
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [responses, setResponses] = useState<VideoResponse[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  const refresh = () => {
    getPrompts().then(setPrompts);
    getResponses().then(setResponses);
  };
  useEffect(() => { refresh(); }, []);

  const activePrompts = prompts.filter(p => p.active);

  const responseFor = (promptId: string) =>
    responses.filter(r => r.promptId === promptId && r.studentId === student.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const openPicker = (promptId: string) => {
    setActivePromptId(promptId);
    fileInputRef.current?.click();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !activePromptId) return;
    if (f.size > MAX_VIDEO_BYTES) {
      alert("حجم الفيديو أكبر من 15 ميجا — اختر فيديو أقصر أو بجودة أقل");
      return;
    }
    const prompt = prompts.find(p => p.id === activePromptId);
    if (!prompt) return;
    setUploadingFor(activePromptId);
    const fr = new FileReader();
    fr.onload = async ev => {
      await submitVideoResponse({
        promptId: prompt.id, promptTitle: prompt.title,
        studentId: student.id, studentName: student.name,
        video: ev.target?.result as string,
      });
      setUploadingFor(null);
      setActivePromptId(null);
      refresh();
    };
    fr.readAsDataURL(f);
  };

  if (activePrompts.length === 0) {
    return (
      <div className="card p-10 text-center text-gray-400">
        <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">ما فيه أسئلة فيديو مطروحة حالياً — تابعنا قريباً</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={onFile} />
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-rose-600" />
        <h3 className="font-bold text-gray-800">اشرح بفيديو</h3>
      </div>
      {activePrompts.map(p => {
        const r = responseFor(p.id);
        return (
          <div key={p.id} className="card p-4 space-y-2">
            <p className="font-bold text-gray-800 text-sm">{p.title}</p>
            {p.description && <p className="text-xs text-gray-500">{p.description}</p>}

            {r?.status === "approved" && (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> اعتُمد فيديوك</span>
                <video src={r.video} controls className="w-full rounded-xl max-h-64" />
              </div>
            )}
            {r?.status === "pending" && (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> بانتظار المراجعة</span>
                <video src={r.video} controls className="w-full rounded-xl max-h-64" />
              </div>
            )}
            {(!r || r.status === "rejected") && (
              <div className="space-y-2">
                {r?.status === "rejected" && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> الفيديو السابق ما اعتُمد{r.reviewerNote ? `: ${r.reviewerNote}` : ""} — سجّل من جديد</p>
                )}
                <button onClick={() => openPicker(p.id)} disabled={uploadingFor === p.id}
                  className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-500 disabled:opacity-50">
                  <Upload className="w-4 h-4" /> {uploadingFor === p.id ? "جارٍ الرفع..." : "ارفع فيديو إجابتك"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
