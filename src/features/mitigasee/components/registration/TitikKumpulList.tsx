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
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-lavender-100 text-purple-500">
          <MapPin className="h-8 w-8" />
        </div>
        <div>
          <p className="font-heading text-lg font-black text-ink-900">
            Belum Ada Titik Terdaftar
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-400">
            Tandai titik kumpul atau evakuasi di tab &quot;Tambah Titik&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-widest text-ink-400">
        {titikList.length} Titik Tersimpan
      </p>

      {titikList.map((titik) => {
        const distance = userPosition
          ? calculateDistance(userPosition, titik)
          : null;

        return (
          <article
            key={titik.id}
            className="overflow-hidden rounded-[1.3rem] border border-purple-700/10 bg-white shadow-sm"
          >
            {/* Foto */}
            {titik.fotoBase64 && (
              <div className="h-36 overflow-hidden">
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
                <h4 className="font-heading text-base font-black text-ink-900">
                  {titik.nama}
                </h4>
                <button
                  type="button"
                  id={`btn-hapus-${titik.id}`}
                  aria-label={`Hapus titik ${titik.nama}`}
                  onClick={() => onDelete(titik.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-coral-200 text-coral-600 transition hover:bg-coral-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Meta info */}
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Koordinat */}
                <span className="inline-flex items-center gap-1 rounded-full bg-lavender-100 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                  <MapPin className="h-3 w-3" />
                  {titik.lat.toFixed(5)}, {titik.lng.toFixed(5)}
                </span>

                {/* Jarak */}
                {distance !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                    <Navigation className="h-3 w-3" />
                    {formatDistance(distance)} dari sini
                  </span>
                )}

                {/* Timestamp */}
                <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-bold text-ink-400">
                  <Calendar className="h-3 w-3" />
                  {formatTimestamp(titik.timestamp)}
                </span>

                {/* Akurasi GPS saat pendaftaran */}
                {titik.accuracy !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                    ±{Math.round(titik.accuracy)}m
                  </span>
                )}
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
