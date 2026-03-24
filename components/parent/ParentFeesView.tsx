"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface Fee {
  _id: string;
  period?: string;
  amountDue?: number;
  amountPaid?: number;
  status: string;
  dueDate?: string;
  fine?: number;
  description?: string;
}

interface Child {
  _id: string;
  name: string;
  className?: string;
}

function ParentFeesViewContent() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [fees, setFees] = useState<Fee[]>([]);
  const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [feesLoading, setFeesLoading] = useState(false);

  useEffect(() => { fetchChildren(); }, []);
  useEffect(() => { if (selectedChildId) fetchFees(selectedChildId); }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/students");
      const data = await res.json();
      if (data.success) {
        const list = data.students || [];
        setChildren(list);
        if (list[0]) setSelectedChildId(list[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchFees = async (childId: string) => {
    setFeesLoading(true);
    try {
      const res = await fetch(`/api/parent/fees/${childId}`);
      const data = await res.json();
      if (data.success) {
        setFees(data.fees || []);
        setSummary({ totalDue: data.totalDue || 0, totalPaid: data.totalPaid || 0 });
      }
    } catch (err) { console.error(err); setFees([]); }
    finally { setFeesLoading(false); }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return { label: "Paid", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      case "partial": return { label: "Partial", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      default: return { label: "Due", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    }
  };

  const fmt = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Fees & Payments" }]} />

      <div className="mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fees & Payments</h1>
          <p className="text-gray-500 text-sm mt-1">View fee records and payment status</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium mb-2">Total Due</p>
              <p className="text-3xl font-bold text-red-700">{fmt(summary.totalDue)}</p>
            </div>
            <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium mb-2">Total Paid</p>
              <p className="text-3xl font-bold text-emerald-700">{fmt(summary.totalPaid)}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Records */}
      {feesLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>
      ) : fees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No fee records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fees.map(fee => {
            const cfg = getStatusConfig(fee.status);
            const Icon = cfg.icon;
            const isDue = fee.status?.toLowerCase() !== "paid";
            const remaining = (fee.amountDue || 0) - (fee.amountPaid || 0);
            return (
              <div key={fee._id} className={`bg-white rounded-2xl border ${cfg.border} shadow-sm overflow-hidden`}>
                <div className={`h-1.5 w-full ${isDue ? "bg-red-400" : "bg-emerald-400"}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{fee.period || fee.description || "Fee Record"}</h3>
                      {fee.dueDate && (
                        <p className="text-sm text-gray-400 mt-0.5">
                          Due: {new Date(fee.dueDate).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-gray-800">{fmt(fee.amountDue || 0)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-emerald-600 mb-1">Paid</p>
                      <p className="text-lg font-bold text-emerald-700">{fmt(fee.amountPaid || 0)}</p>
                    </div>
                    <div className={`${isDue ? "bg-red-50" : "bg-gray-50"} rounded-xl p-3 text-center`}>
                      <p className={`text-xs mb-1 ${isDue ? "text-red-500" : "text-gray-400"}`}>Remaining</p>
                      <p className={`text-lg font-bold ${isDue ? "text-red-600" : "text-gray-400"}`}>{fmt(isDue ? remaining : 0)}</p>
                    </div>
                  </div>

                  {fee.fine && fee.fine > 0 && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Late Fine: {fmt(fee.fine)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ParentFeesView() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>}>
      <ParentFeesViewContent />
    </Suspense>
  );
}
