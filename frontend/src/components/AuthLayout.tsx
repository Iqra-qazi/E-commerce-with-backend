import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="auth-page grid min-h-screen bg-stone-50 text-stone-900 transition-colors lg:grid-cols-[minmax(420px,0.94fr)_1.06fr]">
      <section className="relative flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <a className="brand-mark self-start" href="/" aria-label="Atelier home">
            atelier<span>.</span>
          </a>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
          <p className="eyebrow mb-3">THOUGHTFULLY CHOSEN, ALWAYS</p>
          <h1 className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-[2.65rem]">{title}</h1>
          <p className="mt-3 max-w-sm text-[0.95rem] leading-6 text-stone-500">{description}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-7 border-t border-stone-200 pt-6">{footer}</div>
        </div>

        <p className="text-xs text-stone-400">© 2026 Atelier Supply Co.</p>
      </section>

      <aside className="auth-art relative hidden min-h-screen overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.2em] text-white/75">THE EVERYDAY EDIT</span>
          <ArrowUpRight aria-hidden="true" size={19} className="text-white/75" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-xl">
          <div className="relative mx-auto flex aspect-[1.08] max-h-[440px] items-center justify-center">
            <div className="absolute h-[76%] w-[62%] rotate-[-8deg] rounded-[48%_48%_12%_12%] bg-[#c4a8e8] shadow-[0_35px_80px_rgba(70,48,100,0.18)]" />
            <div className="absolute top-[15%] h-[58%] w-[50%] rotate-[7deg] rounded-[48%_48%_13%_13%] border border-white/55 bg-[#9e78c8]/80 shadow-xl" />
            <div className="absolute bottom-[9%] left-[12%] h-[28%] w-[22%] rotate-[-18deg] rounded-2xl bg-[#f0cfe4] shadow-xl" />
            <div className="absolute right-[10%] bottom-[10%] h-[33%] w-[25%] rotate-[14deg] rounded-[42%_42%_10%_10%] bg-[#b7a4d4] shadow-xl" />
            <div className="absolute top-[24%] right-[22%] grid size-14 rotate-12 place-items-center rounded-full bg-[#f3d9ec] text-[#775397] shadow-lg">
              <Sparkles aria-hidden="true" size={22} />
            </div>
          </div>
          <blockquote className="mt-3 max-w-lg font-serif text-3xl leading-tight tracking-[-0.025em] xl:text-[2.55rem]">
            “The best things are the ones you reach for every day.”
          </blockquote>
          <p className="mt-4 text-sm text-white/70">A considered collection for living well.</p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/70">
          <span className="size-1.5 rounded-full bg-[#e8d1a8]" />
          Made for the rituals that make a life
        </div>
      </aside>
    </main>
  );
}
