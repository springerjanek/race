import AnimatedTypingMotion from "@/components/shadcn-space/animated-text/animated-text-03";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col gap-5">
        <div className="flex gap-2 items-center">
          <h1 className=" text-2xl">Welcome</h1>
          <AnimatedTypingMotion />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
