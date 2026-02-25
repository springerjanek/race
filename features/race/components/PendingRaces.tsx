"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../context/Socket";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Player = {
  socketId: string;
  userId: string;
  username: string;
  progress: number;
};

type Race = {
  id: string;
  name: string;
  hostId: string;
  status: string;
  players: Player[];
};

export const PendingRaces = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);

  console.log(races);

  useEffect(() => {
    if (!socket) return;

    const handleRaceList = (list: Race[]) => {
      setRaces(list.filter((r) => r.status === "pending"));
    };

    socket.on("raceList", handleRaceList);

    socket.emit("getRaceList");

    return () => {
      socket.off("raceList", handleRaceList);
    };
  }, [socket]);

  const joinRace = (raceId: string) => {
    if (!user || !socket) return;
    router.push(`/race/${raceId}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {races.length === 0 && <p>No pending races. Create one!</p>}

      {races.map((race) => (
        <div
          key={race.id}
          className="flex gap-3 items-center p-3 border rounded shadow-sm"
        >
          <span className="font-semibold">{race.name}</span>
          <Button
            onClick={() => joinRace(race.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join
          </Button>
        </div>
      ))}
    </div>
  );
};
