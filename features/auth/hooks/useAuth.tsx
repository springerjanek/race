import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type User = {
  id: string;
  username: string;
  points: number;
  averageWPM: number;
  raceCount: number;
};

type AuthContextType = {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        toast("Login failed :(");
        return;
      }

      const data: User = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      toast("Login success!");
      router.push("/races");
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
