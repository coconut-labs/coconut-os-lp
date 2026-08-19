import { Nav } from "@/components/nav";
import { StatusStrip } from "@/components/status-strip";
import { Hero } from "@/components/hero";
import { Thesis } from "@/components/thesis";
import { PainPoints } from "@/components/pain-points";
import { Stack } from "@/components/stack";
import { Lineage } from "@/components/lineage";
import { PullQuote } from "@/components/pullquote";
import { Syscalls } from "@/components/syscalls";
import { HeroStory } from "@/components/hero-story";
import { Roadmap } from "@/components/roadmap";
import { Progress } from "@/components/progress";
import { Personas } from "@/components/personas";
import { Status } from "@/components/status";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";

export default function Page() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Nav />
      <StatusStrip />
      <Hero />
      <Thesis />
      <PainPoints />
      <Stack />
      <Lineage />
      <Syscalls />
      <PullQuote />
      <HeroStory />
      <Roadmap />
      <Progress />
      <Personas />
      <Status />
      <Footer />
    </main>
  );
}
