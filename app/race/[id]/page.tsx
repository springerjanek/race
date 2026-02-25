"use client";

import { useParams } from "next/navigation";
import { Race } from "@/features/race/components/Race";

export default function RacePage() {
  const params = useParams();
  const raceId = params.id;
  return <Race raceId={raceId} />;
}
