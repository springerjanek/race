import React from "react";

export const RaceCountdown = ({ countdown }: { countdown: number | null }) => {
  return (
    <>
      {countdown !== null && countdown > 0 && (
        <div className="text-4xl font-bold text-center my-8">
          Race starts in: {countdown}
        </div>
      )}
    </>
  );
};
