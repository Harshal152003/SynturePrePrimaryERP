"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ImageIcon, Search, Calendar, MapPin, 
  ChevronRight, Filter, LayoutGrid, List
} from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Badge from "@/components/common/Badge";

interface GalleryItem {
  _id: string;
  title: string;
  albumName: string;
  category: string;
  description?: string;
  images: Array<{ url: string; caption: string }>;
  eventDate: string;
  eventLocation?: string;
  isPublished: boolean;
  featured: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "event", label: "Event" },
  { value: "activity", label: "Activity" },
  { value: "achievement", label: "Achievement" },
  { value: "campus", label: "Campus" },
  { value: "celebration", label: "Celebration" },
];

export default function ParentGalleryView() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        // Parents only see published albums
        const list = (data.galleries || data.data || []).filter((g: GalleryItem) => g.isPublished);
        setGalleries(list);
      }
    } catch (err) {
      console.error("Failed to fetch galleries", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGalleries = galleries.filter((gallery) => {
    const matchesSearch =
      gallery.albumName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gallery.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || gallery.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      event: "from-blue-500 to-indigo-600",
      activity: "from-emerald-500 to-teal-600",
      achievement: "from-amber-500 to-orange-600",
      celebration: "from-rose-500 to-pink-600",
      campus: "from-violet-500 to-purple-600",
    };
    return map[cat] || "from-gray-500 to-slate-600";
  };

  if (loading) {
    return (
      <div className="p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumbs items={[{ label: "Parent Dashboard", href: "/parent-dashboard" }, { label: "Gallery" }]} />

      <div className="mt-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">School Gallery</h1>
          <p className="text-gray-500 mt-1">Explore memories, events, and school activities</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 w-full sm:w-64 bg-white text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white text-sm font-medium pr-8"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {filteredGalleries.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Albums Found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGalleries.map((album) => (
            <div 
              key={album._id}
              onClick={() => router.push(`/parent-dashboard/gallery/${album._id}`)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all cursor-pointer transform hover:-translate-y-1"
            >
              {/* Cover Image */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                {album.images?.[0] ? (
                  <img 
                    src={album.images[0].url} 
                    alt={album.albumName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                {/* Category Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider bg-gradient-to-r ${getCategoryColor(album.category)} shadow-lg`}>
                  {album.category}
                </div>
                {/* Count Overlay */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white border border-white/20 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {album.images?.length || 0}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-violet-600 transition-colors line-clamp-1">{album.albumName}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{album.title}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {album.eventDate ? new Date(album.eventDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently"}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
                    <ChevronRight className="w-4 h-4 text-violet-600 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
