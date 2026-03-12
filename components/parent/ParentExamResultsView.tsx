"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Award, Users, TrendingUp, FileText } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface ExamResult {
  _id: string;
  examName?: string;
  subject?: string;
  totalMarks?: number;
  marksObtained?: number;
  grade?: string;
  date?: string;
  status?: string;
}

interface Child {
  _id: string;
  name: string;
  className?: string;
}

export default function ParentExamResultsView() {
  const searchParams = useSearchParams();
  const preselectedChildId = searchParams.get("childId");

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => { fetchChildren(); }, []);
  useEffect(() => { if (selectedChildId) fetchResults(selectedChildId); }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/students");
      const data = await res.json();
      if (data.success) {
        const list = data.students || [];
        setChildren(list);
        const init = preselectedChildId || list[0]?._id;
        setSelectedChildId(init || "");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchResults = async (childId: string) => {
    setResultsLoading(true);
    try {
      const res = await fetch(`/api/parent/assessments/${childId}`);
      const data = await res.json();
      if (data.success) setResults(data.assessments || []);
      else setResults([]);
    } catch (err) { setResults([]); }
    finally { setResultsLoading(false); }
  };

  const getGradeColor = (grade?: string, pct?: number) => {
    const p = pct || 0;
    if (p >= 90) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (p >= 75) return { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
    if (p >= 60) return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    if (p >= 40) return { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
  };

  const avgPct = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + ((r.marksObtained || 0) / (r.totalMarks || 1)) * 100, 0) / results.length)
    : 0;

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Exam Results" }]} />

      <div className="mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exam Results</h1>
          <p className="text-gray-500 text-sm mt-1">View your child's academic performance</p>
        </div>
        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white font-medium"
            >
              {children.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.className || "—"})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-2">Total Exams</p>
            <p className="text-3xl font-bold text-gray-800">{results.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-2">Average Score</p>
            <p className={`text-3xl font-bold ${avgPct >= 60 ? "text-emerald-600" : "text-red-600"}`}>{avgPct}%</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium mb-2">Best Subject</p>
            <p className="text-lg font-bold text-violet-700 truncate">
              {results.reduce((best, r) => {
                const pct = ((r.marksObtained || 0) / (r.totalMarks || 1)) * 100;
                const bestPct = ((best.marksObtained || 0) / (best.totalMarks || 1)) * 100;
                return pct > bestPct ? r : best;
              }, results[0])?.subject || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {resultsLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
          <p className="text-gray-400 text-sm">Exam results will appear here once they are published.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => {
            const pct = result.totalMarks ? Math.round(((result.marksObtained || 0) / result.totalMarks) * 100) : 0;
            const cfg = getGradeColor(result.grade, pct);
            return (
              <div key={result._id} className={`bg-white rounded-2xl border ${cfg.border} shadow-sm p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{result.examName || "Exam"}</h3>
                    <p className="text-sm text-gray-500">{result.subject} {result.date ? `• ${new Date(result.date).toLocaleDateString("en-IN")}` : ""}</p>
                  </div>
                  <div className={`text-center px-4 py-2 rounded-xl ${cfg.bg}`}>
                    {result.grade && <p className={`text-2xl font-bold ${cfg.text}`}>{result.grade}</p>}
                    <p className={`text-sm font-semibold ${cfg.text}`}>{pct}%</p>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 60 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                    {result.marksObtained ?? "—"} / {result.totalMarks ?? "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
