import Footer from "./components/Footer";
import Hero from "./components/Hero";
import MeetSection from "./components/Meet";
import Navbar from "./components/Navbar";
import TopStories from "./components/TopStories";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <TopStories />
      <MeetSection />
      <Footer />
    </main>
  );
}
