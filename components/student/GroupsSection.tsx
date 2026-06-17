"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Download, FileText, Image as Img, Film, File, X, ArrowRight, MessageSquare } from "lucide-react";
import { useAuth, ChatGroup } from "@/contexts/AuthContext";

interface Msg {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  time: string;
  file?: { name: string; type: string; size: string; data: string };
}

function fmt(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Img className="w-5 h-5 text-blue-500" />;
  if (type.startsWith("video/")) return <Film className="w-5 h-5 text-purple-500" />;
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (type.includes("word") || type.includes("doc")) return <FileText className="w-5 h-5 text-blue-700" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

function Chat({ group, onBack }: { group: ChatGroup; onBack: () => void }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [attach, setAttach] = useState<Msg["file"] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const key = `chat_${group.id}`;

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setMsgs(stored ? JSON.parse(stored) : [{
      id: "w", senderId: "system", senderName: "", senderPhoto: "",
      text: `مرحباً بكم في ${group.name} 👋`,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    }]);
  }, [group.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!text.trim() && !attach) return;
    const msg: Msg = {
      id: Date.now().toString(), senderId: user!.id,
      senderName: user!.name, senderPhoto: user!.photo,
      text: text.trim(),
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      file: attach || undefined,
    };
    const updated = [...msgs, msg];
    setMsgs(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setText(""); setAttach(null);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { alert("الملف يجب أن يكون أقل من 20 ميجا"); return; }
    const r = new FileReader();
    r.onload = ev => setAttach({ name: f.name, type: f.type, size: fmt(f.size), data: ev.target?.result as string });
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const download = (file: Msg["file"]) => {
    if (!file) return;
    const a = document.createElement("a"); a.href = file.data; a.download = file.name; a.click();
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200" style={{ height: "72vh" }}>
      <div className={`bg-gradient-to-l ${group.color} text-white px-4 py-3 flex items-center gap-3`}>
        <button onClick={onBack} className="text-white/80 hover:text-white"><ArrowRight className="w-5 h-5" /></button>
        <span className="text-xl">{group.emoji}</span>
        <div><p className="font-bold">{group.name}</p><p className="text-white/70 text-xs">{group.description}</p></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {msgs.map(m => {
          const isMe = m.senderId === user?.id;
          if (m.senderId === "system") return (
            <div key={m.id} className="text-center">
              <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{m.text}</span>
            </div>
          );
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {m.senderPhoto ? <img src={m.senderPhoto} alt="" className="w-full h-full object-cover" /> : m.senderName[0]}
              </div>
              <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
                {!isMe && <span className="text-xs text-gray-500 px-1">{m.senderName}</span>}
                <div className={`rounded-2xl px-4 py-3 ${isMe ? "bg-blue-800 text-white rounded-tr-none" : "bg-white border border-gray-100 rounded-tl-none"}`}>
                  {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                  {m.file && (
                    <div className={`mt-2 rounded-xl overflow-hidden border ${isMe ? "border-white/20" : "border-gray-200"}`}>
                      {m.file.type.startsWith("image/") ? (
                        <div>
                          <img src={m.file.data} alt="" className="max-w-full max-h-48 object-cover" />
                          <div className={`p-2 flex justify-between text-xs ${isMe ? "bg-white/10 text-white/80" : "bg-gray-50 text-gray-600"}`}>
                            <span>{m.file.name}</span>
                            <button onClick={() => download(m.file)} className="underline">تحميل</button>
                          </div>
                        </div>
                      ) : m.file.type.startsWith("video/") ? (
                        <div>
                          <video src={m.file.data} controls className="max-w-full max-h-48" />
                          <div className={`p-2 flex justify-between text-xs ${isMe ? "bg-white/10 text-white/80" : "bg-gray-50 text-gray-600"}`}>
                            <span>{m.file.name}</span>
                            <button onClick={() => download(m.file)} className="underline">تحميل</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 flex items-center gap-3 ${isMe ? "bg-white/10" : "bg-gray-50"}`}>
                          <FileIcon type={m.file.type} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-gray-800"}`}>{m.file.name}</p>
                            <p className={`text-xs ${isMe ? "text-white/60" : "text-gray-400"}`}>{m.file.size}</p>
                          </div>
                          <button onClick={() => download(m.file)} className={`p-2 rounded-lg ${isMe ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}><Download className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 px-1">{m.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {attach && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-3">
          <FileIcon type={attach.type} />
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{attach.name}</p><p className="text-xs text-gray-400">{attach.size}</p></div>
          <button onClick={() => setAttach(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center">
          <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" onChange={onFile} />
          <button onClick={() => fileRef.current?.click()} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text" value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 text-right"
          />
          <button onClick={send} disabled={!text.trim() && !attach} className="bg-blue-800 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 flex-shrink-0">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupsSection() {
  const { getGroups } = useAuth();
  const [selected, setSelected] = useState<ChatGroup | null>(null);
  const [groups, setGroups] = useState<ChatGroup[]>([]);

  useEffect(() => { setGroups(getGroups()); }, []);

  if (selected) return <Chat group={selected} onBack={() => setSelected(null)} />;

  if (groups.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium">لا توجد جروبات بعد</p>
      <p className="text-sm mt-1">سيقوم الإدارة بإنشاء الجروبات قريباً</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-700">💬 انضم لجروب فريقك وتواصل مع الزملاء وشارك الملفات</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map(g => (
          <button key={g.id} onClick={() => setSelected(g)} className={`card p-5 text-right bg-gradient-to-br ${g.color} text-white hover:shadow-lg transition-all group`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{g.emoji}</span>
              <div>
                <h3 className="font-bold text-lg">{g.name}</h3>
                <p className="text-white/80 text-sm">{g.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/70 text-sm mt-2">
              <span>اضغط للدخول</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
