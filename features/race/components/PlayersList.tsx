import { Player } from "../types";
import { Socket } from "socket.io-client";

export const PlayersList = ({
  players,
  isRacing,
  socket,
  userProgress,
  otherPlayersProgress,
}: {
  players: Player[];
  isRacing: boolean;
  socket: Socket | null;
  userProgress: number;
  otherPlayersProgress: Record<string, number>;
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Players:</h2>
      <ul className="space-y-2">
        {players.map((p) => (
          <li
            key={p.socketId}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span className="font-medium">{p.username}</span>
            {isRacing && (
              <span className="text-sm">
                Progress:
                {p.socketId === socket?.id
                  ? userProgress
                  : otherPlayersProgress[p.socketId] || 0}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
