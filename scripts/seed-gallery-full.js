/**
 * Seed Gallery Script
 * Creates 3 published albums for Little Steps school with 15-20 images each.
 * Uses picsum.photos for real, diverse placeholder images.
 * 
 * Run: node scripts/seed-gallery-full.js
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = require("dotenv").parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  albumName: { type: String, required: true },
  category: {
    type: String,
    enum: ["event", "activity", "achievement", "campus", "celebration", "other"],
    default: "event",
  },
  images: [
    {
      url: { type: String, required: true },
      caption: String,
      uploadedAt: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 },
    },
  ],
  eventDate: Date,
  eventLocation: String,
  isPublished: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);

// ─── Album Definitions ──────────────────────────────────────────────────────
const albums = [
  {
    title: "Annual Day Celebration 2025",
    albumName: "Annual Day 2025",
    description: "Highlights from our spectacular Annual Day celebration, featuring drama, music, and dance performances by our talented students.",
    category: "celebration",
    eventDate: new Date("2025-12-20"),
    eventLocation: "School Auditorium",
    featured: true,
    images: [
      // Use picsum with specific seeds so images are consistent & varied
      { seed: 10, caption: "Opening ceremony - Welcome dance performance" },
      { seed: 11, caption: "Drama performance - Act 1" },
      { seed: 12, caption: "Classical dance by KG students" },
      { seed: 13, caption: "Group song - National Harmony" },
      { seed: 14, caption: "Drama performance - Act 2" },
      { seed: 15, caption: "Award distribution ceremony" },
      { seed: 16, caption: "Best student award" },
      { seed: 17, caption: "Principal's address to parents" },
      { seed: 18, caption: "Colourful costume parade" },
      { seed: 19, caption: "Students with their craft displays" },
      { seed: 20, caption: "Closing ceremony group photo" },
      { seed: 21, caption: "Parents watching the performance" },
      { seed: 22, caption: "Backstage fun moments" },
      { seed: 23, caption: "Trophy for best class" },
      { seed: 24, caption: "Dance finale - All students" },
      { seed: 25, caption: "Teacher appreciation moment" },
      { seed: 26, caption: "Refreshment time after the event" },
    ],
  },
  {
    title: "Sports Day 2025",
    albumName: "Sports Day 2025",
    description: "Our annual sports meet saw amazing energy from all students. From running races to fun relay events, everyone participated with great enthusiasm!",
    category: "event",
    eventDate: new Date("2025-11-15"),
    eventLocation: "School Playground",
    featured: false,
    images: [
      { seed: 30, caption: "100m sprint - Junior category" },
      { seed: 31, caption: "Team relay race in progress" },
      { seed: 32, caption: "Tug of war - KG1 vs KG2" },
      { seed: 33, caption: "Sack race - everyone laughing!" },
      { seed: 34, caption: "Girls' balancing race" },
      { seed: 35, caption: "Warm up exercises" },
      { seed: 36, caption: "March past - school pride" },
      { seed: 37, caption: "Winners on the podium" },
      { seed: 38, caption: "Teacher-parent fun race" },
      { seed: 39, caption: "Lemon and spoon championship" },
      { seed: 40, caption: "Cheering crowd of parents" },
      { seed: 41, caption: "Refreshments during break" },
      { seed: 42, caption: "Medal distribution" },
      { seed: 43, caption: "Closing flag ceremony" },
      { seed: 44, caption: "Group photo - All winners" },
      { seed: 45, caption: "Students celebrating victory" },
      { seed: 46, caption: "Little Steps spirit at its best!" },
      { seed: 47, caption: "Parents cheering from sidelines" },
    ],
  },
  {
    title: "Art & Craft Exhibition 2025",
    albumName: "Art Exhibition",
    description: "Our young artists showcased incredible creativity at this year's Art & Craft Exhibition. From clay models to paintings and origami, the talent on display was truly inspiring.",
    category: "activity",
    eventDate: new Date("2026-01-25"),
    eventLocation: "School Hall",
    featured: false,
    images: [
      { seed: 50, caption: "Clay model of our solar system" },
      { seed: 51, caption: "Watercolour painting by Arjun" },
      { seed: 52, caption: "Origami display - paper animals" },
      { seed: 53, caption: "Finger painting by nursery students" },
      { seed: 54, caption: "Best drawing award winner" },
      { seed: 55, caption: "Craft using recycled materials" },
      { seed: 56, caption: "Welcome board designed by KG students" },
      { seed: 57, caption: "Collage art - Nature theme" },
      { seed: 58, caption: "3D models on display" },
      { seed: 59, caption: "Teachers judging the artwork" },
      { seed: 60, caption: "Students explaining their art" },
      { seed: 61, caption: "Fabric painting showcase" },
      { seed: 62, caption: "Mosaic tiles created by students" },
      { seed: 63, caption: "Parents viewing the exhibition" },
      { seed: 64, caption: "Certificate distribution" },
      { seed: 65, caption: "Group photo at the exhibition" },
    ],
  },
];

// ─── Seed Function ───────────────────────────────────────────────────────────
async function seedGallery() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    for (const albumDef of albums) {
      // Check if album already exists
      const existing = await Gallery.findOne({ albumName: albumDef.albumName });
      if (existing) {
        console.log(`⚠️  Album "${albumDef.albumName}" already exists — skipping.`);
        continue;
      }

      const images = albumDef.images.map(({ seed, caption }) => ({
        url: `https://picsum.photos/seed/${seed}/800/600`,
        caption,
        uploadedAt: new Date(),
        likes: Math.floor(Math.random() * 20),
      }));

      const album = new Gallery({
        title: albumDef.title,
        albumName: albumDef.albumName,
        description: albumDef.description,
        category: albumDef.category,
        eventDate: albumDef.eventDate,
        eventLocation: albumDef.eventLocation,
        isPublished: true,   // ← Published so parents can see it
        featured: albumDef.featured,
        images,
      });

      await album.save();
      console.log(`✅ Created "${albumDef.albumName}" with ${images.length} images — PUBLISHED`);
    }

    console.log("\n🎉 Gallery seeding complete!");

    // Summary
    const total = await Gallery.countDocuments({ isPublished: true });
    console.log(`📊 Total published albums in DB: ${total}`);

  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seedGallery();
