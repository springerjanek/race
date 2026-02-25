export type Player = {
  socketId: string;
  userId: string;
  username: string;
  progress: number;
  totalWpm: number;
};

export type RaceState = {
  id: string;
  name: string;
  status: "pending" | "countdown" | "round1" | "round2" | "finished";
  round: number;
  sentences: string[];
  players: Player[];
  hostId: string;
};
