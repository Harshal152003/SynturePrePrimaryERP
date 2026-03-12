"use client";
import React, { useState, useEffect } from "react";
import { Bus, MapPin, Phone, User as UserIcon } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface TransportRoute {
  _id: string;
  name?: string;
  routeName?: string;
  vehicleNo?: string;
  vehicleType?: string;
  driverId?: { name: string; phone?: string };
  stops?: Array<{ name: string; time?: string; isPassed?: boolean; isChildStop?: boolean }>;
  students?: string[];
}

interface Child {
  _id: string;
  name: string;
  className?: string;
}

export default function ParentTransportView() {
  const [children, setChildren] = useState<Child[]>([]);
  const [transportData, setTransportData] = useState<TransportRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [noRoute, setNoRoute] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => { fetchChildren(); }, []);
  useEffect(() => { if (selectedChildId) fetchTransport(selectedChildId); }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/students");
      const data = await res.json();
      if (data.success && data.students?.length) {
        setChildren(data.students);
        setSelectedChildId(data.students[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchTransport = async (childId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/transport?status=active");
      const data = await res.json();
      const allRoutes: TransportRoute[] = data.routes || data.data || [];
      const childRoute = allRoutes.find(r => r.students?.includes(childId));
      if (childRoute) {
        setTransportData(childRoute);
        setNoRoute(false);
      } else {
        setTransportData(null);
        setNoRoute(true);
      }
    } catch (err) { console.error(err); setNoRoute(true); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Transport" }]} />

      <div className="mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transport Info</h1>
          <p className="text-gray-500 text-sm mt-1">Your child's bus route and driver details</p>
        </div>
        {children.length > 1 && (
          <select
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white font-medium"
          >
            {children.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {noRoute || !transportData ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bus className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Transport Assigned</h3>
          <p className="text-gray-400 text-sm">No active transport route is assigned for {children.find(c => c._id === selectedChildId)?.name || "your child"}.</p>
        </div>
      ) : (
        <div className="space-y-5 max-w-2xl">
          {/* Vehicle Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Bus className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{transportData.name || transportData.routeName || "Route"}</h2>
                  <p className="text-gray-500 text-sm">{transportData.vehicleType || "School Bus"}</p>
                </div>
              </div>
              {transportData.vehicleNo && (
                <div className="mt-4 py-3 px-6 bg-gray-100 rounded-xl text-center">
                  <p className="text-xs text-gray-400 mb-1 font-medium tracking-wider uppercase">Vehicle Number</p>
                  <p className="text-2xl font-bold text-gray-800 tracking-widest">{transportData.vehicleNo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Driver Card */}
          {transportData.driverId && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-violet-500" />
                Driver Information
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{transportData.driverId.name}</p>
                    <p className="text-sm text-gray-400">Assigned Driver</p>
                  </div>
                </div>
                {transportData.driverId.phone && (
                  <a
                    href={`tel:${transportData.driverId.phone}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Driver
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Route Stops */}
          {transportData.stops && transportData.stops.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Route & Stops
              </h3>
              <div className="space-y-0">
                {transportData.stops.map((stop, index) => {
                  const isLast = index === (transportData.stops?.length || 0) - 1;
                  const isChildStop = stop.isChildStop;
                  return (
                    <div key={index} className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                          stop.isPassed ? "bg-emerald-500 border-emerald-500" :
                          isChildStop ? "bg-violet-600 border-violet-600 w-5 h-5 -ml-0.5" :
                          "bg-white border-gray-300"
                        }`} />
                        {!isLast && <div className={`w-0.5 h-10 ${stop.isPassed ? "bg-emerald-400" : "bg-gray-200"}`} />}
                      </div>

                      {/* Stop Info */}
                      <div className={`flex-1 pb-8 ${isChildStop ? "bg-violet-50 rounded-xl px-3 py-2 -mt-0.5" : ""}`}>
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${isChildStop ? "text-violet-800 font-bold" : "text-gray-700"}`}>
                            {stop.name}
                          </p>
                          {stop.time && <span className="text-sm text-gray-400">{stop.time}</span>}
                        </div>
                        {isChildStop && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-violet-700 bg-violet-100 px-2 py-0.5 rounded-lg">
                            <MapPin className="w-3 h-3" />
                            Your Drop-off Point
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
