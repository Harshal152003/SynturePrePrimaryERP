"use client";
import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Building2, Globe } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";

interface SchoolSettings {
  schoolName?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolAddress?: string;
  principalName?: string;
}

export default function ParentContactSchoolView() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success || data.settings) setSettings(data.settings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const contactItems = [
    {
      label: "Phone Number",
      value: settings?.schoolPhone,
      icon: Phone,
      color: "emerald",
      action: settings?.schoolPhone ? `tel:${settings.schoolPhone}` : undefined,
      actionLabel: "Call Now"
    },
    {
      label: "Email Address",
      value: settings?.schoolEmail,
      icon: Mail,
      color: "blue",
      action: settings?.schoolEmail ? `mailto:${settings.schoolEmail}` : undefined,
      actionLabel: "Send Email"
    },
    {
      label: "Address",
      value: settings?.schoolAddress,
      icon: MapPin,
      color: "red",
      action: settings?.schoolAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.schoolAddress)}` : undefined,
      actionLabel: "Open Maps",
      external: true
    },
    {
      label: "Principal",
      value: settings?.principalName,
      icon: Building2,
      color: "violet",
    },
  ].filter(item => item.value);

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Contact School" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Contact School</h1>
        <p className="text-gray-500 text-sm mt-1">Reach out to the school administration</p>
      </div>

      {/* School Identity Card */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 mb-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-10 -translate-x-8" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{settings?.schoolName || "Our School"}</h2>
            {settings?.principalName && (
              <p className="text-violet-200 text-sm mt-1">Principal: {settings.principalName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Items */}
      <div className="space-y-4 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Get in Touch</h2>
        {contactItems.map((item) => (
          <div
            key={item.label}
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between ${item.action ? "hover:border-${item.color}-200 hover:shadow-md transition-all" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                <p className="text-gray-800 font-semibold mt-0.5">{item.value}</p>
              </div>
            </div>
            {item.action && (
              <a
                href={item.action}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 bg-${item.color}-500 hover:bg-${item.color}-600 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap`}
              >
                {item.actionLabel}
              </a>
            )}
          </div>
        ))}

        {contactItems.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-400">No contact information available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
