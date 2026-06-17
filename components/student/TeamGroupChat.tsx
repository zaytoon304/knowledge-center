"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Download, FileText, Image as ImageIcon, Film, File, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  time: string;
  file?: {
    name: string;
    type: string;
    size: string;
    data: string; // base64
  };
}

interface Team {
  id: string;
  name: string;
  competition: string;
  color: string;
  emoji: string;
  members: string[];
}

const TEAMS: Team[] = [
  { id: "wro2025", name: "فريق WRO 2025", competition: "أولمبياد الروبوت العالمي", color: "from-blue-700 to-blue-500", emoji: "🤖", members: [] },
  { id: "steam2025", name: "فريق STEAM", competition: "تحدي STEAM الوطني", color: "from-green-700 to-teal-500", emoji: "🔬", members: [] },
  { id: "ai2025", name: "فريق الذكاء الاصطناعي", competition: "هاكاثون AI المدرسي", color: "from-violet-700 to-purple-500", emoji: "🧠", members: [] },
  { id: "roborave", name: "فريق RoboRave", competition: "مسابقة RoboRave", color: "from-orange-600 to-amber-500", emoji: "🏆", members: [] },
];

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (type.startsWith("video/")) return <Film className="w-5 h-5 text-purple-500" />;
  if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (type.includes("word") || type.includes("doc")) return <FileText className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function TeamGroupChat() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachPreview, setAttachPreview] = useState<ChatMessage["file"] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = selectedTeam ? `chat_${selectedTeam.id}` : "";

  useEffect(() => {
    if (!selectedTeam) return;
    try {
      const stored = localStorage.getItem(storageKey);
      setMessages(stored ? JSON.parse(stored) : getWelcomeMessages(selectedTeam));
    } catch { setMessages([]); }
  }, [selectedTeam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getWelcomeMessages = (team: Team): ChatMessage[] => [
    {
      id: "welcome",
      senderId: "system",
      senderName: "النظام",
      senderPhoto: "",
      text: `مرحباً بكم في جروب ${team.name} 🎉\nيمكنكم هنا التواصل ومشاركة الملفات والصور والفيديوهات مع فريقكم.`,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    },
  ];

  const saveMessages = (msgs: ChatMessage[]) => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(msgs));
  };

  const handleSend = () => {
    if (!input.trim() && !attachPreview) return;
    if (!user || !selectedTeam) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderPhoto: user.photo,
      text: input.trim(),
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      file: attachPreview || undefined,
    };

    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);
    setInput("");
    setAttachPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert("حجم الملف يجب أن يكون أقل من 20 ميجا"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachPreview({
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        data: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadFile = (file: ChatMessage["file"]) => {
    if (!file) return;
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  // Teams list view
  if (!selectedTeam) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-700 font-medium">
            🎯 انضم إلى جروب فريقك للتواصل مع زملائك ومشاركة الملفات
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {TEAMS.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`card p-5 text-right hover:shadow-lg transition-all group cursor-pointer bg-gradient-to-br ${team.color} text-white`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{team.emoji}</span>
                <div>
                  <h3 className="font-bold text-lg">{team.name}</h3>
                  <p className="text-white/80 text-sm">{team.competition}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <span>اضغط للدخول إلى الجروب</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex flex-col" style={{ height: "70vh" }}>
      {/* Chat Header */}
      <div className={`bg-gradient-to-l ${selectedTeam.color} text-white p-4 rounded-t-2xl flex items-center gap-3`}>
        <button onClick={() => setSelectedTeam(null)} className="text-white/80 hover:text-white">
          <ArrowRight className="w-5 h-5" />
        </button>
        <span className="text-2xl">{selectedTeam.emoji}</span>
        <div>
          <h3 className="font-bold">{selectedTeam.name}</h3>
          <p className="text-white/70 text-sm">{selectedTeam.competition}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map(msg => {
          const isMe = msg.senderId === user?.id;
          const isSystem = msg.senderId === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full whitespace-pre-line">{msg.text}</span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {msg.senderPhoto ? <img src={msg.senderPhoto} alt="" className="w-full h-full object-cover" /> : msg.senderName[0]}
              </div>

              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isMe && <span className="text-xs text-gray-500 px-1">{msg.senderName}</span>}
                <div className={`rounded-2xl px-4 py-3 ${isMe ? "bg-blue-800 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"}`}>
                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                  {msg.file && (
                    <div className={`mt-2 rounded-xl overflow-hidden border ${isMe ? "border-white/20" : "border-gray-200"}`}>
                      {msg.file.type.startsWith("image/") ? (
                        <div>
                          <img src={msg.file.data} alt={msg.file.name} className="max-w-full max-h-48 object-cover" />
                          <div className={`p-2 flex items-center justify-between text-xs ${isMe ? "bg-white/10 text-white/80" : "bg-gray-50 text-gray-600"}`}>
                            <span>{msg.file.name}</span>
                            <button onClick={() => downloadFile(msg.file)} className="hover:underline">تحميل</button>
                          </div>
                        </div>
                      ) : msg.file.type.startsWith("video/") ? (
                        <div>
                          <video src={msg.file.data} controls className="max-w-full max-h-48" />
                          <div className={`p-2 flex items-center justify-between text-xs ${isMe ? "bg-white/10 text-white/80" : "bg-gray-50 text-gray-600"}`}>
                            <span>{msg.file.name}</span>
                            <button onClick={() => downloadFile(msg.file)} className="hover:underline">تحميل</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 flex items-center gap-3 ${isMe ? "bg-white/10" : "bg-gray-50"}`}>
                          {getFileIcon(msg.file.type)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-gray-800"}`}>{msg.file.name}</p>
                            <p className={`text-xs ${isMe ? "text-white/60" : "text-gray-400"}`}>{msg.file.size}</p>
                          </div>
                          <button onClick={() => downloadFile(msg.file)} className={`p-2 rounded-lg ${isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-blue-100 hover:bg-blue-200 text-blue-700"}`}>
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 px-1">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {attachPreview && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-3">
          {getFileIcon(attachPreview.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{attachPreview.name}</p>
            <p className="text-xs text-gray-400">{attachPreview.size}</p>
          </div>
          <button onClick={() => setAttachPreview(null)} className="text-gray-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
        <div className="flex gap-2 items-center">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex-shrink-0"
            title="إرفاق ملف"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 text-right"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachPreview}
            className="bg-blue-800 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
