import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { FileText } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using BeaconX services, you accept and agree to be bound by these terms.",
    },
    {
      title: "2. Use of Service",
      content:
        "You agree not to use our chat service for spam, abusive, illegal, or fraudulent activities. We reserve the right to terminate chats that violate these terms.",
    },
    {
      title: "3. Disclaimer",
      content:
        'Our services are provided "as is" without any warranties. BeaconX is not liable for any damages arising from the use of our service.',
    },
    {
      title: "4. Changes to Terms",
      content:
        "We may update these terms at any time. Continued use of the service constitutes acceptance of the new terms.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <BackButton />

        <div className="mt-6 flex items-center gap-3">
          <FileText className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold">Terms of Service</h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 25, 2026</p>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="card-glass p-5">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            If you have any questions about these terms, please contact our support team through the chat widget.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

