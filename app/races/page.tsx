import { RaceCreationDialog } from "@/features/race/components/RaceCreationDialog";
import { PendingRaces } from "@/features/race/components/PendingRaces";

export default function RacesPage() {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mb-15">Races</h1>
      <RaceCreationDialog />

      <p className="mb-3 mt-24">Pending races:</p>
      <PendingRaces />
    </div>
  );
}
