"use client";

import { MapPin, Trash2, Calendar, Navigation } from "lucide-react";
import type { TitikKumpul, LatLng } from "../../types";
import { formatDistance, calculateDistance } from "../../lib/geo";

interface TitikKumpulListProps {
  titikList: TitikKumpul[];
  userPosition: LatLng | null;
  onDelete: (id: string) => void;
}

/**
 * Daftar semua titik kumpul tersimpan.
 * Menampilkan foto, nama, koordinat, timestamp, dan jarak dari user.
 * Opsi hapus untuk keperluan testing/manajemen.
 */
export function TitikKumpulList({
  titikList,
  userPosition,
  onDelete,
}: TitikKumpulListProps) {
  if (titikList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center bg-white/60 border border-purple-700/8 rounded-[2rem] p-6 shadow-[0_14px_42px_rgba(47,23,110,0.04)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-lavender-100 text-purple-700 border border-lavender-250/30 shadow-inner">
          <MapPin className="h-8 w-8" />
        </div>
        <div>
          <p className="font-heading text-lg font-black text-purple-900">
            Belum Ada Titik Terdaftar
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-700">
            Tandai titik kumpul atau evakuasi di tab &quot;Tambah Titik&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-widest text-purple-700">
        {titikList.length} Titik Tersimpan
      </p>

      {titikList.map((titik) => {
        const distance = userPosition
          ? calculateDistance(userPosition, titik)
          : null;

        return (
          <article
            key={titik.id}
            className="overflow-hidden rounded-[1.3rem] border border-purple-750/8 bg-white/80 shadow-[0_14px_42px_rgba(47,23,110,0.06)]"
          >
            {/* Foto */}
            {titik.fotoBase64 && (
              <div className="h-36 overflow-hidden relative border-b border-purple-100 bg-lavender-50">
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent z-10" />
                <img
                  src={titik.fotoBase64}
                  alt={`Foto ${titik.nama}`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-4">
              {/* Nama */}
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-heading text-base font-black text-purple-900">
                  {titik.nama}
                </h4>
                <button
                  type="button"
                  id={`btn-hapus-${titik.id}`}
                  aria-label={`Hapus titik ${titik.nama}`}
                  onClick={() => onDelete(titik.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 text-red-650 bg-white transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Meta info */}
              <div className="mt-3 flex flex-wrap gap-2">
                {/* Koordinat */}
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                  <MapPin className="h-3 w-3 text-purple-400" />
                  {titik.lat.toFixed(5)}, {titik.lng.toFixed(5)}
                </span>

                {/* Jarak */}
                {distance !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-150 px-2.5 py-1 text-[11px] font-bold text-teal-850">
                    <Navigation className="h-3 w-3 text-teal-500" />
                    {formatDistance(distance)} dari sini
                  </span>
                )}

                {/* Timestamp */}
                <span className="inline-flex items-center gap-1 rounded-full bg-cream-50 border border-purple-700/5 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                  <Calendar className="h-3 w-3 text-purple-400" />
                  {formatTimestamp(titik.timestamp)}
                </span>

              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
