// ═══════════════════════════════════════════════════════════════════
// GALLERY MEDIA — the single source of truth for every photo and
// video shown on the site. Everything lives in ONE slideshow
// (src/sections/GallerySection.tsx); no stand-alone images elsewhere.
//
// To add media: drop the file in /public, add an entry below.
// `index` is 1-based and drives the localized alt/label text
// ('gallery.photoAlt' / 'gallery.videoLabel').
// ═══════════════════════════════════════════════════════════════════

export interface GalleryImage {
  kind: 'image';
  id: string;
  index: number;
  jpg: string;
  webp: string;
  width: number;
  height: number;
}

export interface GalleryVideo {
  kind: 'video';
  id: string;
  index: number;
  src: string;
  poster: string;
  width: number;
  height: number;
}

export type GalleryItem = GalleryImage | GalleryVideo;

export const GALLERY_MEDIA: GalleryItem[] = [
  {
    kind: 'image',
    id: 'photo-3',
    index: 1,
    jpg: '/media-3.jpg',
    webp: '/media-3.webp',
    width: 1800,
    height: 1200,
  },
  {
    kind: 'video',
    id: 'video-1',
    index: 1,
    src: '/video-1.mp4',
    poster: '/video-1-poster.jpg',
    width: 464,
    height: 832,
  },
  {
    kind: 'image',
    id: 'photo-1',
    index: 2,
    jpg: '/media-1.jpg',
    webp: '/media-1.webp',
    width: 1200,
    height: 1800,
  },
  {
    kind: 'image',
    id: 'photo-6',
    index: 3,
    jpg: '/media-6.jpg',
    webp: '/media-6.webp',
    width: 1800,
    height: 1200,
  },
  {
    kind: 'video',
    id: 'video-2',
    index: 2,
    src: '/video-2.mp4',
    poster: '/video-2-poster.jpg',
    width: 464,
    height: 832,
  },
  {
    kind: 'image',
    id: 'photo-2',
    index: 4,
    jpg: '/media-2.jpg',
    webp: '/media-2.webp',
    width: 1200,
    height: 1800,
  },
  {
    kind: 'image',
    id: 'photo-4',
    index: 5,
    jpg: '/media-4.jpg',
    webp: '/media-4.webp',
    width: 1200,
    height: 1800,
  },
  {
    kind: 'image',
    id: 'photo-5',
    index: 6,
    jpg: '/media-5.jpg',
    webp: '/media-5.webp',
    width: 1200,
    height: 1800,
  },
];
