"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/common/Badge";
import { showToast } from "@/lib/toast";
import { ArrowLeft, Calendar, MapPin, ImageIcon, Loader2, X, ChevronLeft, ChevronRight, Play, Film } from "lucide-react";

interface GalleryImage {
  url: string;
  caption: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  albumName: string;
  category: string;
  description?: string;
  images: GalleryImage[];
  eventDate: string;
  eventLocation?: string;
  isPublished: boolean;
  featured: boolean;
}

// ── helpers ─────────────────────────────────────────────────────────────────
const isVideo = (url: string) => {
  const exts = [".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v", ".3gp"];
  const lower = url.toLowerCase();
  if (lower.includes("/video/upload/")) return true;
  return exts.some(ext => lower.split("?")[0].endsWith(ext));
};

/** Cloudinary video → thumbnail image URL (first frame) */
const cloudinaryThumb = (url: string) =>
  url.replace("/upload/", "/upload/so_0/")
     .replace(/\.(mp4|mov|webm|avi|mkv|m4v|3gp)(\?.*)?$/i, ".jpg");

export default function ParentGalleryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIdx === null || !gallery?.images) return;
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowLeft") setSelectedIdx(p => (p! === 0 ? gallery.images.length - 1 : p! - 1));
      if (e.key === "ArrowRight") setSelectedIdx(p => (p! === gallery.images.length - 1 ? 0 : p! + 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIdx, gallery]);

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/gallery/${id}`);
        const data = await res.json();
        if (data.success) setGallery(data.gallery);
        else { showToast.error("Failed to fetch gallery"); router.push("/parent-dashboard/gallery"); }
      } catch { showToast.error("Error"); router.push("/parent-dashboard/gallery"); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [id, router]);

  const getCategoryColor = (cat: string): "success" | "warning" | "danger" | "info" | "primary" => {
    const m: Record<string, any> = { event: "primary", activity: "success", achievement: "warning", campus: "info", celebration: "danger" };
    return m[cat] || "info";
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
  );
  if (!gallery) return null;

  const selectedItem = selectedIdx !== null ? gallery.images[selectedIdx] : null;
  const videoCount = gallery.images.filter(i => isVideo(i.url)).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back */}
      <button onClick={() => router.push("/parent-dashboard/gallery")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Gallery
      </button>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{gallery.albumName}</h1>
                <Badge variant={getCategoryColor(gallery.category)}>{gallery.category}</Badge>
              </div>
              <p className="text-gray-600 text-lg">{gallery.title}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Date:</span>
              {gallery.eventDate ? new Date(gallery.eventDate).toLocaleDateString() : "No Date"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Location:</span> {gallery.eventLocation || "—"}
            </div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Media:</span>
              {gallery.images?.length || 0} items
              {videoCount > 0 && <span className="ml-1 text-emerald-600 font-semibold">({videoCount} video{videoCount > 1 ? "s" : ""})</span>}
            </div>
          </div>
          {gallery.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
              <p className="text-gray-700 leading-relaxed">{gallery.description}</p>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-500" /> Media Gallery
          </h2>

          {gallery.images && gallery.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {gallery.images.map((img, idx) => {
                const vid = isVideo(img.url);
                const thumb = vid ? cloudinaryThumb(img.url) : img.url;
                return (
                  <div key={idx} className="group relative break-inside-avoid">
                    <div
                      className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-square cursor-pointer hover:shadow-lg transition-all relative"
                      onClick={() => setSelectedIdx(idx)}
                    >
                      {/* Thumbnail or video poster */}
                      <img
                        src={thumb}
                        alt={img.caption || `Media ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // If cloudinary thumbnail fails, hide and show placeholder
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {/* Video overlay */}
                      {vid && (
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                            <Play className="w-5 h-5 text-gray-800 fill-gray-800 ml-1" />
                          </div>
                          <span className="mt-2 text-white text-xs font-bold tracking-wide">VIDEO</span>
                        </div>
                      )}
                    </div>
                    {img.caption && (
                      <div className="mt-2 text-sm text-gray-600 truncate px-1" title={img.caption}>
                        {img.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">No media in this album</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox / Video Modal ────────────────────────────────────────── */}
      {selectedItem !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedIdx(null)}
        >
          {/* Close */}
          <button onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50">
            <X className="w-8 h-8" />
          </button>

          {/* Prev */}
          {gallery.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(p => p === 0 ? gallery.images.length - 1 : p! - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50">
                <ChevronLeft className="w-12 h-12" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(p => p === gallery.images.length - 1 ? 0 : p! + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50">
                <ChevronRight className="w-12 h-12" />
              </button>
            </>
          )}

          <div className="w-full max-w-5xl flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="relative w-full flex justify-center" style={{ height: "75vh" }}>
              {isVideo(selectedItem.url) ? (
                /* ── HTML5 Video Player ── */
                <video
                  key={selectedItem.url}
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg shadow-2xl"
                  style={{ maxHeight: "75vh" }}
                  onError={(e) => {
                    const v = e.target as HTMLVideoElement;
                    v.poster = cloudinaryThumb(selectedItem.url);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                /* ── Image lightbox ── */
                <img
                  src={selectedItem.url}
                  alt={selectedItem.caption || `Photo ${selectedIdx! + 1}`}
                  className="max-w-full max-h-full object-contain select-none rounded"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              {selectedItem.caption && (
                <p className="text-white text-lg font-medium mb-1">{selectedItem.caption}</p>
              )}
              <p className="text-white/50 text-sm tracking-wider">
                {selectedIdx! + 1} / {gallery.images.length}
                {isVideo(selectedItem.url) && <span className="ml-2 text-emerald-400 font-bold">🎬 VIDEO</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
