"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSocket } from "../context/Socket";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

export const RaceCreationDialog = () => {
  const [raceName, setRaceName] = useState("");
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (raceName.trim().length <= 0) {
      toast("Please input race name!!");
      return;
    }

    if (!user || !socket) return;

    // Emit the createRace event with socket.id as hostId and user info
    socket.emit("createRace", {
      hostId: user.id,
      name: raceName,
      userId: user.id,
      username: user.username,
    });

    toast("Race created!");
    setRaceName("");

    // After creation, listen for the race list to get the new race ID
    const handleRaceList = (races: any[]) => {
      const newRace = races.find(
        (r) => r.name === raceName && r.status === "pending",
      );
      if (newRace) {
        socket.off("raceList", handleRaceList);
        router.push(`/race/${newRace.id}`);
      }
    };
    socket.on("raceList", handleRaceList);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Race!</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Start the race.</DialogTitle>
            <DialogDescription>
              Simply input your custom race name and create the lobby.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 mb-4 flex flex-col gap-3">
            <Label htmlFor="name-1">Name</Label>
            <Input
              id="name-1"
              name="name"
              placeholder="Crazy Race :O"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={raceName.trim().length <= 0} type="submit">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
