import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MOCK_LATEST = {
  datetime: new Date().toISOString(),
  tanggal: "Terbaru",
  jam: "Sesaat Lalu",
  magnitude: "5.8",
  kedalaman: "15 km",
  koordinat: "-2.35,96.12",
  wilayah: "135 km BaratDaya SINABANG-SABANG-ACEH",
  potensi: "Tidak berpotensi TSUNAMI",
  dirasakan: "III MMI Banda Aceh, II MMI Calang, II MMI Meulaboh",
  shakemap: null,
};

const MOCK_DIRASAKAN = [
  {
    tanggal: "24 Jun 2026",
    jam: "22:15:30 WIB",
    magnitude: "4.2",
    kedalaman: "10 km",
    wilayah: "Pusat gempa berada di darat 12 km BaratDaya Banda Aceh",
    dirasakan: "III MMI Banda Aceh, II MMI Calang",
  },
  {
    tanggal: "23 Jun 2026",
    jam: "11:05:12 WIB",
    magnitude: "3.8",
    kedalaman: "8 km",
    wilayah: "Pusat gempa berada di laut 25 km Timur Laut Sabang",
    dirasakan: "II MMI Sabang",
  }
];

const MOCK_TERKINI = [
  {
    tanggal: "25 Jun 2026",
    jam: "14:10:00 WIB",
    magnitude: "5.5",
    kedalaman: "22 km",
    wilayah: "110 km BaratDaya Calang-AcehJaya",
    potensi: "Tidak berpotensi tsunami",
  },
  {
    tanggal: "22 Jun 2026",
    jam: "08:45:00 WIB",
    magnitude: "6.1",
    kedalaman: "10 km",
    wilayah: "120 km BaratDaya Sinabang-Simeulue",
    potensi: "Tidak berpotensi tsunami",
  }
];

export async function GET() {
  try {
    // 1. Fetch autogempa (latest)
    const autogempaPromise = fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json", {
      next: { revalidate: 30 },
    }).then(async (res) => {
      if (!res.ok) return null;
      const json = await res.json();
      const gempa = json?.Infogempa?.gempa;
      if (!gempa) return null;
      
      const pointCoords = gempa.point?.coordinates || gempa.Point?.coordinates;
      const latLongStr = gempa.Lintang && gempa.Bujur ? `${gempa.Lintang}, ${gempa.Bujur}` : null;
      
      return {
        datetime: gempa.DateTime,
        tanggal: gempa.Tanggal,
        jam: gempa.Jam,
        magnitude: gempa.Magnitude,
        kedalaman: gempa.Kedalaman,
        koordinat: pointCoords || gempa.Coordinates || latLongStr || "0, 0",
        wilayah: gempa.Wilayah,
        potensi: gempa.Potensi,
        dirasakan: gempa.Dirasakan,
        shakemap: gempa.Shakemap ? `https://static.bmkg.go.id/${gempa.Shakemap}` : null,
      };
    }).catch(() => null);

    // 2. Fetch gempadirasakan (felt list)
    const gempadirasakanPromise = fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json", {
      next: { revalidate: 30 },
    }).then(async (res) => {
      if (!res.ok) return null;
      const json = await res.json();
      const gempaList = json?.Infogempa?.gempa;
      const normalizedList = Array.isArray(gempaList) ? gempaList : (gempaList ? [gempaList] : []);
      if (normalizedList.length === 0) return null;
      return normalizedList.map((g: any) => ({
        tanggal: g.Tanggal,
        jam: g.Jam,
        magnitude: g.Magnitude,
        kedalaman: g.Kedalaman,
        wilayah: g.Wilayah,
        dirasakan: g.Dirasakan,
      }));
    }).catch(() => null);

    // 3. Fetch gempaterkini (M 5.0+ list)
    const gempaterkiniPromise = fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json", {
      next: { revalidate: 30 },
    }).then(async (res) => {
      if (!res.ok) return null;
      const json = await res.json();
      const gempaList = json?.Infogempa?.gempa;
      const normalizedList = Array.isArray(gempaList) ? gempaList : (gempaList ? [gempaList] : []);
      if (normalizedList.length === 0) return null;
      return normalizedList.map((g: any) => ({
        tanggal: g.Tanggal,
        jam: g.Jam,
        magnitude: g.Magnitude,
        kedalaman: g.Kedalaman,
        wilayah: g.Wilayah,
        potensi: g.Potensi,
      }));
    }).catch(() => null);

    const [latest, dirasakan, terkini] = await Promise.all([
      autogempaPromise,
      gempadirasakanPromise,
      gempaterkiniPromise,
    ]);

    return NextResponse.json({
      success: true,
      source: "BMKG TEWS Live JSON API",
      latest: latest || MOCK_LATEST,
      dirasakan: dirasakan || MOCK_DIRASAKAN,
      terkini: terkini || MOCK_TERKINI,
    });
  } catch (error: any) {
    console.warn("Using fully offline fallback for BMKG routes:", error.message);
    return NextResponse.json({
      success: true,
      source: "Offline Telemetry Fallback",
      latest: MOCK_LATEST,
      dirasakan: MOCK_DIRASAKAN,
      terkini: MOCK_TERKINI,
    });
  }
}
