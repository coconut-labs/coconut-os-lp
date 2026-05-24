import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Thesis } from "@/components/thesis";
import { PainPoints } from "@/components/pain-points";
import { Stack } from "@/components/stack";
import { Syscalls } from "@/components/syscalls";
import { HeroStory } from "@/components/hero-story";
import { Roadmap } from "@/components/roadmap";
import { Personas } from "@/components/personas";
import { Status } from "@/components/status";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Thesis />
      <PainPoints />
      <Stack />
      <Syscalls />
      <HeroStory />
      <Roadmap />
      <Personas />
      <Status />
      <Footer />
    </main>
  );
}
