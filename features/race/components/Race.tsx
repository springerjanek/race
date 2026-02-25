"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/features/race/context/Socket";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { RaceStatus } from "@/features/race/components/RaceStatus";
import { RaceCountdown } from "@/features/race/components/RaceCountdown";
import { PlayersList } from "@/features/race/components/PlayersList";
import { Player, RaceState } from "@/features/race/types";
import { ParamValue } from "next/dist/server/request/params";

export const Race = ({ raceId }: { raceId: ParamValue }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [currentText, setCurrentText] = useState<string>("");
  const [userProgress, setUserProgress] = useState(0);
  const [otherPlayersProgress, setOtherPlayersProgress] = useState<
    Record<string, number>
  >({});

  console.log(raceState);
  const isHost = raceState?.hostId === user?.id;
  const currentRound = raceState?.round || 0;
  const isRacing =
    raceState?.status === "round1" || raceState?.status === "round2";

  useEffect(() => {
    if (!socket || !raceId) return;

    socket.emit("getRace", raceId);

    const handleRaceUpdate = (data: RaceState) => {
      setRaceState(data);
      setPlayers(data.players || []);
      if (data.sentences && data.round > 0) {
        setCurrentText(data.sentences[data.round - 1] || "");
      }
    };

    socket.on("raceUpdate", handleRaceUpdate);

    return () => {
      socket.off("raceUpdate", handleRaceUpdate);
    };
  }, [socket, raceId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !raceId) return;

    // Join the race when component mounts
    if (user) {
      socket.emit("joinRace", { raceId, user });
    }

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      setRaceState((prev) =>
        prev ? { ...prev, players: updatedPlayers } : prev,
      );
    };

    const handleCountdown = (count: number) => {
      setCountdown(count);
      if (count === 0) {
        setCountdown(null);
      }
    };

    const handleRaceStarted = (data: {
      status: "pending" | "countdown" | "round1" | "round2" | "finished";
      round: number;
      sentences: string[];
      players: Player[];
      hostId: string;
    }) => {
      const newState: RaceState = {
        id: raceId as string,
        name: raceState?.name || "",
        ...data,
      };
      setRaceState(newState);
      setPlayers(data.players);
      setCurrentText(data.sentences[data.round - 1] || "");
      setCountdown(null);
    };

    const handlePlayerProgress = (data: {
      socketId: string;
      username: string;
      progress: number;
    }) => {
      setOtherPlayersProgress((prev) => ({
        ...prev,
        [data.socketId]: data.progress,
      }));
    };

    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("countdown", handleCountdown);
    socket.on("raceStarted", handleRaceStarted);
    socket.on("playerProgress", handlePlayerProgress);

    return () => {
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("countdown", handleCountdown);
      socket.off("raceStarted", handleRaceStarted);
      socket.off("playerProgress", handlePlayerProgress);
    };
  }, [socket, raceId, user]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      let correctLength = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === currentText[i]) {
          correctLength++;
        } else {
          break;
        }
      }

      setUserProgress(correctLength);

      if (socket && raceId) {
        socket.emit("progress", { raceId, index: correctLength });
      }
    },
    [socket, raceId, currentText],
  );

  const handleStartRace = () => {
    if (socket && raceId) {
      socket.emit("startRace", raceId);
    }
  };

  if (raceState?.status === "finished") {
    const me = raceState.players.find((player) => player.userId === user?.id);
    console.log(me);
    return (
      <div className="flex justify-center items-center flex-col">
        <p>Race finished!</p>
        <p>Your WPM:</p>
        {me?.totalWpm}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Race: {raceState?.name || raceId}
      </h1>

      {raceState && (
        <RaceStatus
          raceState={raceState}
          playersCount={raceState?.players.length}
          isHost={isHost}
          handleStartRace={handleStartRace}
        />
      )}

      <RaceCountdown countdown={countdown} />

      {isRacing && currentText && (
        <div className="mb-8">
          <div className="flex mb-2 gap-1">
            <p>Round: </p>
            {currentRound}
          </div>
          <p className="text-lg leading-relaxed p-4 bg-gray-100 rounded">
            {currentText.split("").map((char, index) => (
              <span
                key={index}
                className={
                  index < userProgress
                    ? "text-green-500"
                    : index === userProgress
                      ? "bg-yellow-200"
                      : ""
                }
              >
                {char}
              </span>
            ))}
          </p>
        </div>
      )}

      {isRacing && (
        <div className="mb-8">
          <input
            type="text"
            value={userProgress > 0 ? currentText.slice(0, userProgress) : ""}
            onChange={handleTextChange}
            placeholder="Start typing here..."
            className="w-full p-4 border border-gray-300 rounded"
            autoFocus
          />
        </div>
      )}

      <PlayersList
        players={players}
        isRacing={isRacing}
        socket={socket}
        userProgress={userProgress}
        otherPlayersProgress={otherPlayersProgress}
      />
    </div>
  );
};
