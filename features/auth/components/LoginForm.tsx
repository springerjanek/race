"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim().length <= 0) {
      toast("Please input username!!");
      return;
    }
    await login(username);
  };

  return (
    <form className="flex gap-3" onSubmit={handleSubmit}>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />
      <Button type="submit" disabled={username.trim().length <= 0}>
        Enter
      </Button>
    </form>
  );
};
