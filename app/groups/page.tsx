"use client";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Users, ArrowRight, Lock, Hash, Paperclip, Video, FileText, X, Image as ImageIcon, Mic, Square, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cloudListen, cloudTransact, cloudSet } from "@/lib/cloud";

interface Attachment {
  kind: "image" | "file" | "video" | "audio";
  data?: string;   // صورة أو ملف أو فيديو مرفوع أو تسجيل صوتي — Base64
  name?: string;   // اسم الملف أو مدة التسجيل الصوتي/الفيديو
  url?: string;    // فيديو — رابط (الطريقة القديمة، لسه شغالة)
}

const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 15 ميجا — حماية لقاعدة البيانات من ملفات ضخمة
const MAX_RECORD_SECONDS = 120; // حد أقصى دقيقتين للتسجيل الصوتي

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface ChatMessage {
  id: string;
  content: string;
  senderName: string;
  senderId: string;
  timestamp: string;
  attachment?: Attachment;
}

interface GroupWithMembers {
  id: string; name: string; type: "general" | "team";
  emoji: string; color: string; description: string; createdAt: string;
  members?: string[];
}

const ADMIN_ID = "__admin__";
const ADMIN_NAME = "إدارة المركز";
const ADMIN_SIGNATURE = "إعداد: مشروع الموهبة والذكاء الاصطناعي — محمد زيتون";

function loadMessages(groupId: string): ChatMessage[] {
  try { const d = localStorage.getItem(`kc_chat_${groupId}`); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveMessagesLocal(groupId: string, msgs: ChatMessage[]) {
  localStorage.setItem(`kc_chat_${groupId}`, JSON.stringify(msgs));
}
function loadGroups(): GroupWithMembers[] {
  try { const d = localStorage.getItem("kc_groups"); return d ? JSON.parse(d) : []; } catch { return []; }
}
function saveGroupsLocal(gs: GroupWithMembers[]) {
  localStorage.setItem("kc_groups", JSON.stringify(gs));
}
function fileToBase64(file: File): Promise<string> {
  return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target?.result as string); fr.readAsDataURL(file); });
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return new Date(ts).toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
}

export default function GroupsPage() {
  const { user, isLoggedIn, getAllStudents, getAllCoordinators } = useAuth();
  const [adminCheck, setAdminCheck] = useState(false);

  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupWithMembers | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef<number>(0);

  useEffect(() => {
    setAdminCheck(typeof window !== "undefined" && localStorage.getItem("kc_admin_auth") === "1");
    setGroups(loadGroups());
    const unsub = cloudListen<GroupWithMembers[]>("kc_groups", data => {
      if (Array.isArray(data)) { saveGroupsLocal(data); setGroups(data); }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeGroup) return;
    setMessages(loadMessages(activeGroup.id));
    const unsub = cloudListen<ChatMessage[]>(`kc_chat_${activeGroup.id}`, data => {
      const list = Array.isArray(data) ? data : [];
      saveMessagesLocal(activeGroup.id, list);
      setMessages(list);
    });
    return unsub;
  }, [activeGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { if (recordTimerRef.current) clearInterval(recordTimerRef.current); };
  }, []);

  const currentId = adminCheck ? ADMIN_ID : (user?.id || "");
  const currentName = adminCheck ? ADMIN_NAME : (user?.name || "زائر");

  /* فلتر الجروبات التي يرى فيها المستخدم */
  const visibleGroups = groups.filter(g => {
    if (adminCheck) return true;
    if (g.type === "general") return true;
    if (!currentId) return false;
    return g.members?.includes(currentId);
  });

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPendingAttachment({ kind: "image", data: await fileToBase64(f), name: f.name });
    e.target.value = "";
  };
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPendingAttachment({ kind: "file", data: await fileToBase64(f), name: f.name });
    e.target.value = "";
  };
  const attachVideo = () => {
    if (!videoUrl.trim()) return;
    setPendingAttachment({ kind: "video", url: videoUrl.trim() });
    setVideoUrl(""); setShowVideoInput(false);
  };
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > MAX_VIDEO_BYTES) {
      alert("حجم الفيديو كبير جداً (الحد الأقصى 15 ميجابايت). اختر مقطعاً أقصر أو بجودة أقل.");
      e.target.value = ""; return;
    }
    setPendingAttachment({ kind: "video", data: await fileToBase64(f), name: f.name });
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = ev => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const durationSec = Math.round((Date.now() - recordStartRef.current) / 1000);
        const fr = new FileReader();
        fr.onload = ev => {
          setPendingAttachment({ kind: "audio", data: ev.target?.result as string, name: formatDuration(durationSec) });
        };
        fr.readAsDataURL(blob);
      };
      mediaRecorderRef.current = mr;
      recordStartRef.current = Date.now();
      mr.start();
      setRecordSeconds(0);
      setRecording(true);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => {
          if (s + 1 >= MAX_RECORD_SECONDS) { stopRecording(); return s; }
          return s + 1;
        });
      }, 1000);
    } catch {
      alert("تعذّر الوصول للمايكروفون. تأكد من السماح للمتصفح باستخدام المايك.");
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pendingAttachment) || !activeGroup) return;
    if (!adminCheck && !isLoggedIn) return;
    const groupId = activeGroup.id;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      senderName: currentName,
      senderId: currentId,
      timestamp: new Date().toISOString(),
      ...(pendingAttachment ? { attachment: pendingAttachment } : {}),
    };
    setInput(""); setPendingAttachment(null);
    // معاملة آمنة: أكثر من عضو قد يرسل رسالة بنفس اللحظة تماماً بجروب مزدحم
    await cloudTransact<ChatMessage[]>(`kc_chat_${groupId}`, current => {
      const list = Array.isArray(current) ? current : loadMessages(groupId);
      return [...list, msg];
    });
  };

  /* قائمة الأعضاء المتاحة للإضافة */
  const allUsers = [...getAllStudents().filter(s => s.status === "approved"), ...getAllCoordinators().filter(c => c.status === "approved")];
  const filteredUsers = allUsers.filter(u =>
    !memberSearch || u.name.includes(memberSearch)
  );

  const toggleMember = (uid: string) => {
    if (!activeGroup) return;
    const updated = groups.map(g => {
      if (g.id !== activeGroup.id) return g;
      const members = g.members?.includes(uid)
        ? g.members.filter(m => m !== uid)
        : [...(g.members || []), uid];
      return { ...g, members };
    });
    saveGroupsLocal(updated);
    cloudSet("kc_groups", updated);
    setGroups(updated);
    setActiveGroup(updated.find(g => g.id === activeGroup.id) || null);
  };

  if (!adminCheck && !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-blue-700" />
        </div>
        <h2 className="font-bold text-gray-800 text-xl">الجروبات للأعضاء فقط</h2>
        <p className="text-gray-500 text-sm">يجب تسجيل الدخول للوصول إلى الجروبات</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card p-5 mb-5 bg-gradient-to-l from-blue-800 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">الجروبات</h1>
            <p className="text-white font-semibold text-sm">{visibleGroups.length} جروب متاح</p>
          </div>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">لا توجد جروبات متاحة</p>
          <p className="text-sm mt-1">يمكن للأدمن إنشاء الجروبات من لوحة الإدارة</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[400px]">
          {/* Groups List */}
          <div className={`${activeGroup ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 gap-2`}>
            {visibleGroups.map(g => {
              const msgs = loadMessages(g.id);
              const last = msgs[msgs.length - 1];
              return (
                <button key={g.id} onClick={() => setActiveGroup(g)}
                  className={`card p-4 text-right hover:shadow-md transition-all flex items-center gap-3 ${activeGroup?.id === g.id ? "ring-2 ring-blue-500" : ""}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {g.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-gray-800 text-sm">{g.name}</span>
                      {last && <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(last.timestamp)}</span>}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{last ? last.content : g.description}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${g.type === "general" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {g.type === "general" ? "عام" : "فريق"}
                      </span>
                      {(g.members?.length ?? 0) > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Users className="w-3 h-3" />{g.members?.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat View */}
          {activeGroup && (
            <div className="flex-1 flex flex-col card overflow-hidden">
              {/* Chat Header */}
              <div className={`bg-gradient-to-l ${activeGroup.color} p-4 flex items-center gap-3`}>
                <button onClick={() => setActiveGroup(null)} className="md:hidden text-white/80 hover:text-white">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-2xl">{activeGroup.emoji}</div>
                <div className="flex-1">
                  <p className="font-bold text-white">{activeGroup.name}</p>
                  <p className="text-white/70 text-xs">{activeGroup.description}</p>
                </div>
                {adminCheck && (
                  <button onClick={() => setShowMembers(!showMembers)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <Users className="w-3.5 h-3.5" /> إدارة الأعضاء
                  </button>
                )}
              </div>

              {/* Member Manager (admin only) */}
              {showMembers && adminCheck && (
                <div className="border-b p-3 bg-blue-50 space-y-2 max-h-48 overflow-y-auto">
                  <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    placeholder="ابحث عن طالب أو منسق..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none" />
                  <div className="space-y-1">
                    {filteredUsers.map(u => {
                      const isMember = activeGroup.members?.includes(u.id);
                      return (
                        <div key={u.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                          <div>
                            <span className="text-sm font-medium text-gray-800">{u.name}</span>
                            <span className={`text-xs mr-2 px-1.5 py-0.5 rounded-full ${u.role === "student" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                              {u.role === "student" ? "طالب" : "منسق"}
                            </span>
                          </div>
                          <button onClick={() => toggleMember(u.id)}
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${isMember ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>
                            {isMember ? "إزالة" : "إضافة"}
                          </button>
                        </div>
                      );
                    })}
                    {filteredUsers.length === 0 && <p className="text-center text-sm text-gray-400 py-2">لا توجد نتائج</p>}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Hash className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد رسائل بعد. ابدأ المحادثة!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === currentId;
                    const isFromAdmin = msg.senderId === ADMIN_ID;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[75%] ${isMe ? "items-start" : "items-end"} flex flex-col gap-1`}>
                          {!isMe && <span className="text-xs text-gray-500 px-1">{msg.senderName}</span>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? "bg-blue-700 text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm"}`}>
                            {isMe && <span className="block text-xs text-blue-200 mb-0.5">{msg.senderName}</span>}

                            {msg.attachment?.kind === "image" && (
                              <img src={msg.attachment.data} alt={msg.attachment.name || ""} className="rounded-xl max-w-full max-h-64 object-cover mb-2" />
                            )}
                            {msg.attachment?.kind === "video" && msg.attachment.data && (
                              <video src={msg.attachment.data} controls className="rounded-xl max-w-full max-h-64 mb-2" />
                            )}
                            {msg.attachment?.kind === "video" && msg.attachment.url && (
                              <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-2 text-xs font-medium ${isMe ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"}`}>
                                <Video className="w-4 h-4 flex-shrink-0" /> رابط فيديو
                              </a>
                            )}
                            {msg.attachment?.kind === "audio" && (
                              <div className="mb-2">
                                <audio src={msg.attachment.data} controls className="max-w-full" style={{ height: "36px" }} />
                              </div>
                            )}
                            {msg.attachment?.kind === "file" && (
                              <a href={msg.attachment.data} download={msg.attachment.name}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-2 text-xs font-medium ${isMe ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"}`}>
                                <FileText className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{msg.attachment.name || "ملف مرفق"}</span>
                              </a>
                            )}

                            {msg.content}

                            {isFromAdmin && (
                              <p className={`mt-2 pt-1.5 border-t text-[10px] ${isMe ? "border-white/20 text-blue-200" : "border-gray-100 text-gray-400"}`}>
                                {ADMIN_SIGNATURE}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 px-1">{timeAgo(msg.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* مرفق قيد الإرسال */}
              {pendingAttachment && (
                <div className="px-3 pt-2 border-t bg-white">
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700">
                    {pendingAttachment.kind === "image" && <ImageIcon className="w-4 h-4 flex-shrink-0" />}
                    {pendingAttachment.kind === "video" && <Video className="w-4 h-4 flex-shrink-0" />}
                    {pendingAttachment.kind === "audio" && <Mic className="w-4 h-4 flex-shrink-0" />}
                    {pendingAttachment.kind === "file" && <FileText className="w-4 h-4 flex-shrink-0" />}
                    <span className="flex-1 truncate">
                      {pendingAttachment.kind === "audio" ? `تسجيل صوتي — ${pendingAttachment.name}` : (pendingAttachment.name || pendingAttachment.url || "مرفق")}
                    </span>
                    <button onClick={() => setPendingAttachment(null)} className="text-blue-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}
              {showVideoInput && (
                <div className="px-3 pt-2 border-t bg-white flex gap-2">
                  <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                    placeholder="رابط الفيديو (يوتيوب أو رابط مباشر)" dir="ltr"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none font-mono" />
                  <button onClick={attachVideo} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">إرفاق</button>
                  <button onClick={() => { setShowVideoInput(false); setVideoUrl(""); }} className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm">إلغاء</button>
                </div>
              )}
              {recording && (
                <div className="px-3 pt-2 border-t bg-red-50 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
                  <span className="text-sm text-red-700 font-semibold flex-1">جارِ التسجيل... {formatDuration(recordSeconds)}</span>
                  <button onClick={stopRecording} className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Square className="w-3 h-3" /> إيقاف وإرفاق
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t bg-white flex gap-2">
                <label className="w-10 h-10 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer" title="إرفاق صورة">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
                <label className="w-10 h-10 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer" title="إرفاق ملف / خطاب">
                  <Paperclip className="w-4 h-4" />
                  <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*" className="hidden" onChange={handleFile} />
                </label>
                <label className="w-10 h-10 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer" title="رفع فيديو من الجهاز">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                </label>
                <button onClick={() => setShowVideoInput(v => !v)}
                  className={`w-10 h-10 flex-shrink-0 border rounded-xl flex items-center justify-center transition-colors ${showVideoInput ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  title="إرفاق رابط فيديو">
                  <Video className="w-4 h-4" />
                </button>
                <button onClick={recording ? stopRecording : startRecording}
                  className={`w-10 h-10 flex-shrink-0 border rounded-xl flex items-center justify-center transition-colors ${recording ? "bg-red-600 border-red-600 text-white animate-pulse" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  title={recording ? "إيقاف التسجيل" : "تسجيل رسالة صوتية"}>
                  {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-gray-50"
                />
                <button onClick={sendMessage}
                  disabled={!input.trim() && !pendingAttachment}
                  className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-600 transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
