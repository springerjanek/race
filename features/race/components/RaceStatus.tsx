import { Button } from "@/components/ui/button";
import { RaceState } from "../types";

export const RaceStatus = ({
  raceState,
  playersCount,
  isHost,
  handleStartRace,
}: {
  raceState: RaceState | null;
  playersCount: number | undefined;
  isHost: boolean;
  handleStartRace: () => void;
}) => {
  console.log(isHost, playersCount);
  return (
    <>
      {raceState?.status === "pending" && playersCount && playersCount < 2 && (
        <p className="text-gray-500">Waiting for players...</p>
      )}
      {raceState?.status === "pending" &&
        playersCount &&
        playersCount >= 2 &&
        isHost && (
          <Button
            onClick={handleStartRace}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Start Race
          </Button>
        )}
      {raceState?.status === "pending" &&
        playersCount &&
        playersCount >= 2 &&
        !isHost && (
          <p className="text-gray-500">Waiting for host to start...</p>
        )}
    </>
  );
};
