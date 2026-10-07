import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import StatsBar from "./components/StatsBar";
import TopStories from "./components/TopStories";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <StatsBar />
      <TopStories />
      <Footer />
    </main>
  );
}
