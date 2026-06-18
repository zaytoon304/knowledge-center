"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap, Play, FileText, CheckCircle, Circle, ChevronRight,
  Award, Download, Search, BookOpen, User, PenLine
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  pdfUrl: string;
  pdfName: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  emoji: string;
  instructor: string;
  duration: string;
  lessons: Lesson[];
  createdAt: string;
}

function extractYouTubeId(url: string): string {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : "";
}

function loadCourses(): Course[] {
  try {
    const d = localStorage.getItem("kc_courses");
    if (!d) return [];
    return JSON.parse(d).map((c: Course) => ({ ...c, lessons: c.lessons || [] }));
  } catch { return []; }
}

function loadProgress(): Record<string, string[]> {
  try {
    const d = localStorage.getItem("kc_course_progress");
    return d ? JSON.parse(d) : {};
  } catch { return {}; }
}

function saveProgress(p: Record<string, string[]>) {
  localStorage.setItem("kc_course_progress", JSON.stringify(p));
}

function generateCertificate(studentName: string, course: Course) {
  const date = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>شهادة إتمام</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Cairo', Arial, sans-serif; background: #f0f4ff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .cert { width: 800px; background: white; border: 12px solid #1e3a8a; padding: 50px; text-align: center; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
  .cert::before { content: ''; position: absolute; inset: 15px; border: 2px solid #d4af37; pointer-events: none; }
  .top-bar { background: linear-gradient(135deg, #1e3a8a, #3730a3); color: white; margin: -50px -50px 40px; padding: 20px; }
  .top-bar h2 { font-size: 14px; opacity: 0.8; }
  .top-bar h1 { font-size: 22px; font-weight: 900; }
  .emoji { font-size: 64px; margin: 10px 0; }
  .cert-title { font-size: 28px; font-weight: 900; color: #1e3a8a; margin: 10px 0; }
  .presented { font-size: 14px; color: #6b7280; margin: 20px 0 5px; }
  .student-name { font-size: 38px; font-weight: 900; color: #d4af37; border-bottom: 3px solid #d4af37; display: inline-block; padding: 0 20px 5px; margin-bottom: 20px; }
  .course-info { font-size: 15px; color: #374151; margin: 10px 0; line-height: 1.8; }
  .course-name { font-size: 20px; font-weight: 700; color: #1e3a8a; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .sig { text-align: center; }
  .sig-line { width: 150px; border-bottom: 2px solid #374151; margin-bottom: 8px; }
  .sig-name { font-size: 14px; font-weight: 700; color: #1e3a8a; }
  .sig-title { font-size: 11px; color: #6b7280; }
  .seal { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #1e3a8a, #3730a3); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; line-height: 1.5; }
  .date-box { font-size: 13px; color: #374151; }
  @media print { body { background: white; } .cert { box-shadow: none; } }
</style>
</head>
<body>
<div class="cert">
  <div class="top-bar">
    <h2>مركز المعرفة والابتكار STEAM</h2>
    <h1>بمدارس الأرقم &bull; وحدة الموهبة والذكاء الاصطناعي</h1>
  </div>
  <div class="emoji">${course.emoji || "🎓"}</div>
  <div class="cert-title">شهادة إتمام الدورة</div>
  <div class="presented">تُمنح هذه الشهادة إلى</div>
  <div class="student-name">${studentName}</div>
  <div class="course-info">
    <div>لإتمامه/ها بنجاح دورة</div>
    <div class="course-name">${course.title}</div>
    ${course.instructor ? `<div>تحت إشراف: ${course.instructor}</div>` : ""}
    ${course.duration ? `<div>مدة الدورة: ${course.duration}</div>` : ""}
    <div>عدد الدروس المكتملة: ${course.lessons.length} درس</div>
  </div>
  <div class="footer">
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-name">${course.instructor || "المشرف"}</div>
      <div class="sig-title">مشرف الموهبة والذكاء الاصطناعي</div>
    </div>
    <div class="seal">
      <div>مركز</div>
      <div>المعرفة</div>
      <div>STEAM</div>
    </div>
    <div class="date-box">
      <div style="font-size:11px;color:#9ca3af">تاريخ الإصدار</div>
      <div style="font-weight:700">${date}</div>
    </div>
  </div>
</div>
<script>window.print();</script>
</body>
</html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [studentName, setStudentName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [certCourse, setCertCourse] = useState<Course | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCourses(loadCourses());
    setProgress(loadProgress());
    const n = localStorage.getItem("kc_student_name");
    if (n) setStudentName(n);
  }, []);

  const toggleLesson = (courseId: string, lessonId: string) => {
    if (!studentName) { setShowNamePrompt(true); return; }
    const updated = { ...progress };
    const done = updated[courseId] || [];
    const wasCompleted = done.includes(lessonId);
    if (wasCompleted) {
      updated[courseId] = done.filter(l => l !== lessonId);
    } else {
      updated[courseId] = [...done, lessonId];
      const course = courses.find(c => c.id === courseId);
      if (course && course.lessons.length > 0) {
        const allDone = course.lessons.every(l => updated[courseId].includes(l.id));
        if (allDone) setCertCourse(course);
      }
    }
    setProgress(updated);
    saveProgress(updated);
  };

  const completedCount = (courseId: string) => (progress[courseId] || []).length;
  const isLessonDone = (courseId: string, lessonId: string) => (progress[courseId] || []).includes(lessonId);
  const isCourseCompleted = (course: Course) => course.lessons.length > 0 && completedCount(course.id) >= course.lessons.length;

  const filtered = courses.filter(c => !search || c.title?.includes(search) || c.description?.includes(search) || c.instructor?.includes(search));

  // ===== شهادة الإتمام =====
  if (certCourse) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">مبروك!</h2>
          <p className="text-gray-500 mb-1">أكملت دورة</p>
          <p className="font-bold text-blue-800 text-lg mb-6">{certCourse.title}</p>
          <button onClick={() => { generateCertificate(studentName, certCourse); setCertCourse(null); }}
            className="w-full bg-blue-800 text-white py-3 rounded-2xl font-bold text-base mb-3 flex items-center justify-center gap-2 hover:bg-blue-700">
            <Download className="w-5 h-5" /> استلم شهادتك
          </button>
          <button onClick={() => setCertCourse(null)} className="text-sm text-gray-400 hover:text-gray-600">لاحقاً</button>
        </div>
      </div>
    );
  }

  // ===== نافذة اسم الطالب =====
  if (showNamePrompt) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">أدخل اسمك</h2>
          <p className="text-gray-400 text-sm mb-5">سيُستخدم اسمك في شهادة الإتمام</p>
          <input ref={nameRef} defaultValue={studentName}
            placeholder="اسمك الكامل..."
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-center text-base outline-none focus:border-blue-400 mb-4 bg-gray-50" />
          <button onClick={() => {
            const n = nameRef.current?.value?.trim() || "";
            if (n) { setStudentName(n); localStorage.setItem("kc_student_name", n); }
            setShowNamePrompt(false);
          }} className="w-full bg-blue-800 text-white py-3 rounded-2xl font-bold hover:bg-blue-700">
            حفظ وتابع
          </button>
        </div>
      </div>
    );
  }

  // ===== تفاصيل الدورة =====
  if (selectedCourse) {
    const done = progress[selectedCourse.id] || [];
    const total = selectedCourse.lessons.length;
    const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <button onClick={() => { setSelectedCourse(null); setSelectedLesson(null); }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
          <ChevronRight className="w-4 h-4" /> العودة للدورات
        </button>

        <div className="card p-6 bg-gradient-to-l from-teal-700 to-green-700 text-white">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{selectedCourse.emoji || "📚"}</div>
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">{selectedCourse.title}</h1>
              {selectedCourse.instructor && <p className="text-green-200 text-sm">المدرب: {selectedCourse.instructor}</p>}
              {selectedCourse.duration && <p className="text-green-200 text-sm">المدة: {selectedCourse.duration}</p>}
            </div>
            {isCourseCompleted(selectedCourse) && (
              <button onClick={() => generateCertificate(studentName || "الطالب", selectedCourse)}
                className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-300 flex-shrink-0">
                <Award className="w-4 h-4" /> شهادتي
              </button>
            )}
          </div>
          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-green-200 mb-1.5">
                <span>{done.length} من {total} دروس مكتملة</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
        </div>

        {selectedCourse.description && (
          <div className="card p-4">
            <p className="text-gray-600 text-sm leading-relaxed">{selectedCourse.description}</p>
          </div>
        )}

        {/* مشغل الفيديو */}
        {selectedLesson && (
          <div className="card overflow-hidden">
            <div className="bg-gray-900 px-4 py-2.5 flex items-center gap-2">
              <Play className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-medium">{selectedLesson.title}</span>
            </div>
            {selectedLesson.videoUrl ? (() => {
              const vid = extractYouTubeId(selectedLesson.videoUrl);
              return vid ? (
                <div className="relative" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={`https://www.youtube.com/embed/${vid}?rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              ) : (
                <div className="p-4 bg-gray-50">
                  <a href={selectedLesson.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline flex items-center gap-2">
                    <Play className="w-4 h-4" /> فتح الفيديو في نافذة جديدة
                  </a>
                </div>
              );
            })() : (
              <div className="p-6 bg-gray-50 text-center text-gray-400 text-sm">لا يوجد فيديو لهذا الدرس</div>
            )}
            <div className="p-4 flex items-center justify-between gap-3 bg-gray-50">
              {selectedLesson.pdfUrl ? (
                <a href={selectedLesson.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 text-sm hover:underline">
                  <FileText className="w-4 h-4" /> {selectedLesson.pdfName || "تحميل المادة"}
                </a>
              ) : <div />}
              <button onClick={() => toggleLesson(selectedCourse.id, selectedLesson.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isLessonDone(selectedCourse.id, selectedLesson.id) ? "bg-green-100 text-green-700" : "bg-blue-800 text-white hover:bg-blue-700"}`}>
                {isLessonDone(selectedCourse.id, selectedLesson.id)
                  ? <><CheckCircle className="w-4 h-4" /> مكتمل</>
                  : <><Circle className="w-4 h-4" /> علّم كمكتمل</>}
              </button>
            </div>
          </div>
        )}

        {/* قائمة الدروس */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-700" /> قائمة الدروس ({total})
          </h3>
          {total === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">لا توجد دروس بعد — سيضيفها المشرف من لوحة الإدارة</p>
          ) : (
            <div className="space-y-2">
              {selectedCourse.lessons.map((lesson, idx) => {
                const lessonDone = isLessonDone(selectedCourse.id, lesson.id);
                const isActive = selectedLesson?.id === lesson.id;
                return (
                  <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-right flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${lessonDone ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {lessonDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${lessonDone ? "line-through text-gray-400" : "text-gray-700"}`}>{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lesson.videoUrl && <span className="text-[10px] text-blue-500 flex items-center gap-0.5"><Play className="w-2.5 h-2.5" /> فيديو</span>}
                        {lesson.pdfUrl && <span className="text-[10px] text-red-500 flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> PDF</span>}
                        {lesson.duration && <span className="text-[10px] text-gray-400">{lesson.duration}</span>}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 rotate-180" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{studentName || "اسمك غير محدد"}</span>
          </div>
          <button onClick={() => setShowNamePrompt(true)} className="text-xs text-blue-600 hover:underline">
            {studentName ? "تغيير الاسم" : "أدخل اسمك للشهادة"}
          </button>
        </div>
      </div>
    );
  }

  // ===== قائمة الدورات =====
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card p-6 bg-gradient-to-l from-teal-800 to-green-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">الدورات التدريبية</h1>
              <p className="text-green-200 text-sm">تعلّم واحصل على شهادتك</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
            <div className="text-3xl font-bold">{courses.length}</div>
            <div className="text-green-200 text-xs">دورة</div>
          </div>
        </div>
      </div>

      {/* السبورة الذكية */}
      <div className="card p-4 flex items-center justify-between bg-gradient-to-l from-indigo-50 to-blue-50 border border-indigo-100">
        <div>
          <p className="font-bold text-indigo-800 text-sm">🖊️ السبورة الذكية</p>
          <p className="text-indigo-500 text-xs mt-0.5">ارسم واشرح وأضف صور أثناء الشرح</p>
        </div>
        <Link href="/whiteboard" className="flex items-center gap-2 bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors">
          <PenLine className="w-4 h-4" /> افتح السبورة
        </Link>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في الدورات..."
            className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-green-400 bg-gray-50" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <GraduationCap className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-semibold">{courses.length === 0 ? "لا توجد دورات بعد" : "لا توجد نتائج"}</p>
          {courses.length === 0 && <p className="text-sm mt-1 text-gray-300">أضف دورات من لوحة الإدارة ← الدورات</p>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => {
            const done = completedCount(course.id);
            const total = course.lessons?.length || 0;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            const completed = isCourseCompleted(course);

            return (
              <div key={course.id} onClick={() => { setSelectedCourse(course); setSelectedLesson(course.lessons?.[0] || null); }}
                className="card p-5 cursor-pointer hover:shadow-lg transition-all group hover:border-green-200 border border-transparent">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {course.emoji || "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{course.title}</h3>
                      {completed && <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {course.instructor && <span className="text-xs text-gray-400">{course.instructor}</span>}
                      {course.duration && <span className="text-xs text-gray-300">• {course.duration}</span>}
                    </div>
                  </div>
                </div>
                {course.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{course.description}</p>}
                {total > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{total} دروس</span>
                      <span>{done} مكتمل</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-300">
                    <BookOpen className="w-3 h-3" /> لا توجد دروس بعد
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
