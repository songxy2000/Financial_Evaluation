import { apiGet } from "@/data/http";
import type { AwardItem } from "@/types/evaluation";

export async function getAwardYears(): Promise<number[]> {
  try {
    const payload = await apiGet<{ years: number[] }>("/api/v1/awards/years");
    if (Array.isArray(payload.years)) return payload.years;
    return [];
  } catch {
    return [];
  }
}

export async function getAwardsByYear(year?: number): Promise<AwardItem[]> {
  try {
    const query = typeof year === "number" ? `?year=${year}` : "";
    const payload = await apiGet<{ year: number; displayYearLabel: string; items: AwardItem[] }>(
      `/api/v1/awards${query}`,
    );
    return Array.isArray(payload.items) ? payload.items : [];
  } catch {
    return [];
  }
}
