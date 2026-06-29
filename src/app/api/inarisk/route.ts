import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MOCK_SERVICES = [
  { name: "inarisk/Arah_jalur_evakuasi", type: "MapServer" },
  { name: "inarisk/batas_administrasi", type: "MapServer" },
  { name: "inarisk/Faults", type: "MapServer" },
  { name: "inarisk/Faults_new", type: "MapServer" },
  { name: "inarisk/global_tsunami_modelling", type: "MapServer" },
  { name: "inarisk/INDEKS_BAHAYA_GEMPABUMI", type: "ImageServer" },
  { name: "inarisk/INDEKS_BAHAYA_LIKUEFAKSI", type: "ImageServer" },
  { name: "inarisk/INDEKS_BAHAYA_TSUNAMI", type: "ImageServer" },
  { name: "inarisk/INDEKS_BAHAYA_BANJIR", type: "ImageServer" },
  { name: "inarisk/INDEKS_BAHAYA_TANAHLONGSOR", type: "ImageServer" },
  { name: "inarisk/INDEKS_BAHAYA_CUACAEKSTRIM", type: "ImageServer" },
  { name: "inarisk/Jalur_evakuasi", type: "MapServer" },
  { name: "inarisk/layer_bahaya_gempabumi", type: "ImageServer" },
  { name: "inarisk/layer_bahaya_tsunami", type: "ImageServer" },
  { name: "inarisk/layer_bahaya_banjir", type: "ImageServer" },
  { name: "inarisk/layer_bahaya_cuaca_ekstrim", type: "ImageServer" },
  { name: "inarisk/layer_bahaya_kekeringan", type: "ImageServer" },
  { name: "inarisk/layer_bahaya_kebakaran_hutan_dan_lahan", type: "ImageServer" },
  { name: "inarisk/layer_bahaya_letusan_gunungapi", type: "ImageServer" },
  { name: "inarisk/layer_kerentanan_gempabumi", type: "ImageServer" },
  { name: "inarisk/layer_risiko_gempabumi", type: "ImageServer" },
  { name: "inarisk/layer_risiko_tsunami", type: "ImageServer" },
  { name: "inarisk/layer_risiko_banjir", type: "ImageServer" },
  { name: "inarisk/layer_risiko_cuaca_ekstrim", type: "ImageServer" }
];

export async function GET() {
  try {
    const res = await fetch("https://gis.bnpb.go.id/server/rest/services/inarisk?f=pjson", {
      next: { revalidate: 3600 } // Cache for 1 hour on server
    });

    if (!res.ok) {
      throw new Error(`Inarisk server responded with status: ${res.status}`);
    }

    const data = await res.json();
    const services = data?.services;

    if (!Array.isArray(services)) {
      throw new Error("Invalid Inarisk response structure");
    }

    return NextResponse.json({
      success: true,
      source: "BNPB Inarisk GIS REST API",
      services: services.map((s: any) => ({
        name: s.name,
        type: s.type,
      })),
    });
  } catch (error: any) {
    console.warn("Using offline fallback for Inarisk API proxy:", error.message);
    return NextResponse.json({
      success: true,
      source: "Offline GIS Directory Fallback",
      services: MOCK_SERVICES,
    });
  }
}
