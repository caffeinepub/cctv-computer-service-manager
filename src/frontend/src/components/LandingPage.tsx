import { Button } from "@/components/ui/button";
import { Camera, ChevronRight, Cpu, Phone, Shield, Wrench } from "lucide-react";
import { motion } from "motion/react";
import type { AppView } from "../App";

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/uploads/kalai-logo-2.jpeg"
              alt="KALAI INFO TECH"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>7373713213</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative py-20 md:py-32 bg-grid">
          {/* Background logo watermark */}
          <img
            src="/assets/uploads/kalai-logo-2.jpeg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain opacity-[0.04] pointer-events-none select-none"
          />
          {/* Background gradient orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "oklch(0.62 0.17 220 / 0.08)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: "oklch(0.62 0.16 290 / 0.06)" }}
          />

          <div className="container mx-auto px-4 relative">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Center logo */}
              <motion.div
                variants={fadeUp}
                className="mb-6 flex justify-center"
              >
                <img
                  src="/assets/uploads/kalai-logo-2.jpeg"
                  alt="KALAI INFO TECH"
                  className="h-24 w-auto object-contain drop-shadow-md"
                />
              </motion.div>

              <motion.div variants={fadeUp} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    background: "oklch(0.92 0.06 220 / 0.8)",
                    borderColor: "oklch(0.75 0.1 220)",
                    color: "oklch(0.35 0.15 220)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                    style={{ background: "oklch(0.62 0.17 220)" }}
                  />
                  CCTV & Computer Solutions
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance"
              >
                Kalai Info Tech
                <span
                  className="block"
                  style={{ color: "oklch(0.55 0.18 220)" }}
                >
                  Sales & Service
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Expert CCTV surveillance systems and computer solutions. Log
                your service request instantly and track it in real-time — fast,
                transparent, reliable.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="gap-2 font-semibold shadow-elevated px-8"
                  onClick={() => onNavigate("customer")}
                  data-ocid="nav.customer_portal_button"
                >
                  <Wrench className="w-4 h-4" />
                  Request Service
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 font-semibold px-8"
                  onClick={() => onNavigate("admin")}
                  data-ocid="nav.admin_login_button"
                >
                  <Shield className="w-4 h-4" />
                  Admin Login
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <ServiceCard
                icon={<Camera className="w-6 h-6" />}
                title="CCTV Systems"
                description="Installation, maintenance, and repair of all CCTV and surveillance systems. DVR/NVR setup, IP cameras, and network configuration."
                color="290"
                items={[
                  "HD & 4K Camera Installation",
                  "DVR/NVR Configuration",
                  "Remote Monitoring Setup",
                  "Preventive Maintenance",
                ]}
              />
              <ServiceCard
                icon={<Cpu className="w-6 h-6" />}
                title="Computer Services"
                description="Complete computer sales, repair, and networking solutions for home and business. Hardware upgrades to software troubleshooting."
                color="200"
                items={[
                  "Laptop & Desktop Repair",
                  "Hardware Upgrades",
                  "Virus Removal",
                  "Network Setup",
                ]}
              />
            </motion.div>
          </div>
        </section>

        {/* CTA bar */}
        <section
          className="py-12 border-t border-border/50"
          style={{ background: "oklch(0.62 0.17 220 / 0.05)" }}
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4 font-medium">
              Need immediate assistance? Log your request now.
            </p>
            <Button
              onClick={() => onNavigate("customer")}
              className="gap-2"
              data-ocid="nav.customer_portal_button"
            >
              <Phone className="w-4 h-4" />
              Start Service Request
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">KALAI INFO TECH</p>
          <p>BHARATHI COMPLEX, SENTHAMANGALAM, THIRUVARUR-610001</p>
          <p>
            <Phone className="inline w-3.5 h-3.5 mr-1 align-middle" />
            7373713213
          </p>
          <p className="pt-1">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  color,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  items: string[];
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border bg-card p-6 hover:shadow-elevated transition-shadow duration-300"
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{
          background: `oklch(0.92 0.06 ${color} / 0.8)`,
          color: `oklch(0.4 0.14 ${color})`,
        }}
      >
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: `oklch(0.62 0.14 ${color})` }}
            />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
