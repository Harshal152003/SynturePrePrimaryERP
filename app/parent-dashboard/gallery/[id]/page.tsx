"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/common/Badge";
import { showToast } from "@/lib/toast";
import { ArrowLeft, Calendar, MapPin, ImageIcon, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function ParentGalleryDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [gallery, setGallery] = useState<GalleryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    // Handle keyboard navigation for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null || !gallery?.images) return;
            if (e.key === "Escape") setSelectedImageIndex(null);
            if (e.key === "ArrowLeft") {
                setSelectedImageIndex(prev => prev === 0 ? gallery.images.length - 1 : prev! - 1);
            }
            if (e.key === "ArrowRight") {
                setSelectedImageIndex(prev => prev === gallery.images.length - 1 ? 0 : prev! + 1);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, gallery]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch(`/api/gallery/${id}`);
                const data = await res.json();
                if (data.success) {
                    setGallery(data.gallery);
                } else {
                    showToast.error("Failed to fetch gallery details");
                    router.push("/parent-dashboard/gallery");
                }
            } catch (err) {
                showToast.error("An error occurred");
                router.push("/parent-dashboard/gallery");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGallery();
        }
    }, [id, router]);

    const getCategoryColor = (
        category: string
    ): "success" | "warning" | "danger" | "info" | "primary" => {
        const colors: Record<string, "success" | "warning" | "danger" | "info" | "primary"> = {
            event: "primary",
            activity: "success",
            achievement: "warning",
            campus: "info",
            celebration: "danger",
            other: "info",
        };
        return colors[category] || "info";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!gallery) return null;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Back Button */}
            <button
                onClick={() => router.push("/parent-dashboard/gallery")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Gallery
            </button>

            <div className="space-y-6">
                {/* Header Info */}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Date:</span>
                            {gallery.eventDate ? new Date(gallery.eventDate).toLocaleDateString() : "No Date"}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Location:</span>
                            {gallery.eventLocation || "No Location"}
                        </div>
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Total Photos:</span>
                            {gallery.images?.length || 0}
                        </div>
                    </div>

                    {gallery.description && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{gallery.description}</p>
                        </div>
                    )}
                </div>

                {/* Images Grid */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                        Photo Gallery
                    </h2>

                    {gallery.images && gallery.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {gallery.images.map((img, index) => (
                                <div key={index} className="group relative break-inside-avoid">
                                    <div
                                        className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square cursor-pointer hover:shadow-md transition-all"
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.caption || `Photo ${index + 1}`}
                                            loading="lazy"
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    {img.caption && (
                                        <div className="mt-2 text-sm text-gray-600 truncate px-1" title={img.caption}>
                                            {img.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="font-medium">No photos in this album</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && gallery.images && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <button
                        onClick={() => setSelectedImageIndex(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors z-50"
                        title="Close"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {gallery.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex(prev => prev === 0 ? gallery.images.length - 1 : prev! - 1);
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors z-50"
                                title="Previous"
                            >
                                <ChevronLeft className="w-12 h-12" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex(prev => prev === gallery.images.length - 1 ? 0 : prev! + 1);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors z-50"
                                title="Next"
                            >
                                <ChevronRight className="w-12 h-12" />
                            </button>
                        </>
                    )}

                    <div className="w-full flex flex-col items-center justify-center max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full flex justify-center h-[75vh]">
                            <img
                                src={gallery.images[selectedImageIndex].url}
                                alt={gallery.images[selectedImageIndex].caption || `Photo ${selectedImageIndex + 1}`}
                                className="max-w-full max-h-full object-contain select-none"
                            />
                        </div>
                        <div className="mt-6 text-center">
                            {gallery.images[selectedImageIndex].caption && (
                                <p className="text-white text-lg font-medium mb-2">
                                    {gallery.images[selectedImageIndex].caption}
                                </p>
                            )}
                            <p className="text-white/50 text-sm tracking-wider">
                                {selectedImageIndex + 1} / {gallery.images.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
