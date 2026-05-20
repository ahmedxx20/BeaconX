import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Cpu, Globe, Shield, TrendingUp } from "lucide-react";

export default function AboutUs() {
  const navigate = useNavigate();

  const assetUrls = [
    "https://rork.app/pa/nriacf1zfr5jibz8cv8a6/2nzndoeivd6rucrwfjshn",
    "https://rork.app/pa/nriacf1zfr5jibz8cv8a6/lbuojs37s7iw0pqlcyksc",
    "https://rork.app/pa/nriacf1zfr5jibz8cv8a6/p0vdiw7jufz72n391fa72",
    "https://rork.app/pa/nriacf1zfr5jibz8cv8a6/pca9udjq7359ejv8qxgwf",
  ];

  const sections = [
    {
      icon: <Globe className="h-6 w-6 text-emerald-400" />,
      title: "Who We Are",
      content:
        "BeaconX was established in January 2023 in the United States and officially launched in April 2023. We partnered with the world's largest AI-powered mining network, developed by leading trading, mining, and investment experts.",
      image: assetUrls[0],
    },
    {
      icon: <Cpu className="h-6 w-6 text-blue-400" />,
      title: "Our Technology",
      content:
        "Our platform channels all investments through AI-powered mining pumps designed to achieve high profit rates with maximum security. Our advanced robots monitor market movements and analyze prices across global cryptocurrency markets 24/7. They are programmed for professional fund management: generating profits and stopping losses automatically to ensure complete security for all users.",
      image: assetUrls[1],
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-amber-400" />,
      title: "Our Investment Approach",
      content:
        "No experience required. Invest, relax, and collect your profits daily. We eliminate risk by using over 120 profit-generating strategies that activate only when all predefined market conditions are met. These strategies include long-term holding, accumulation, stop-loss, take-profit orders, and integration of key technical indicators alongside mining operations.",
      image: assetUrls[2],
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      title: "Security & Transparency",
      content:
        "BeaconX maintains a large team of supervisors overseeing all technical, financial, and legal operations. This ensures complete security, transparency, and stability across all investment plans. We continuously develop our platform to become the world's leading investment company.",
      image: assetUrls[3],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
            <span className="text-3xl font-bold text-emerald-400">B</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold">About BeaconX</h1>
          <p className="mt-2 text-muted-foreground">
            Automated, secure investing powered by decentralized AI
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="card-glass overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={section.image}
                  alt={section.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 card-glow-green p-6 text-center">
          <h2 className="text-xl font-bold">Our Commitment</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            BeaconX is distinguished by financial innovation and a firm commitment to providing safe, reliable, and transparent investment services to users worldwide. There is no room for risk — only secure, automated growth.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
