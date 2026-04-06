import {
  Header,
  Hero,
  Numbers,
  ClientLogos,
  ForWho,
  HowItWorks,
  Features,
  FAQ,
  CTA,
  Footer,
} from '../components/home';
import { WolerzitoChat } from '../components/wolerzito';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Numbers />
        <ClientLogos />
        <ForWho />
        <HowItWorks />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />

      {/* Chat Qualificador */}
      <WolerzitoChat />
    </div>
  );
}
