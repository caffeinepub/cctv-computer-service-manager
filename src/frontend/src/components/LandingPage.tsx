import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  ChevronRight,
  Cpu,
  Eye,
  Laptop,
  Loader2,
  Monitor,
  Network,
  Phone,
  Server,
  Shield,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppView } from "../App";
import { ServiceType } from "../backend.d";
import { useAverageRating, useSubmitServiceRequest } from "../hooks/useQueries";

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

// ─── Product Data ────────────────────────────────────────────────────────────

interface Product {
  icon: React.ReactNode;
  image?: string;
  name: string;
  description: string;
  price: string;
  category: "cctv" | "computer";
}

const cctvProducts: Product[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1.jpeg",
    name: "HD Bullet Camera",
    description: "1080p & 4K outdoor surveillance, IR night vision up to 30m",
    price: "₹1,500 – ₹4,500",
    category: "cctv",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1.jpeg",
    name: "Dome Camera",
    description: "Indoor ceiling mount, 2MP-8MP, wide-angle 110°",
    price: "₹1,200 – ₹3,500",
    category: "cctv",
  },
  {
    icon: <Server className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1.jpeg",
    name: "DVR / NVR System",
    description: "4/8/16 channel recording systems with remote viewing",
    price: "₹4,000 – ₹15,000",
    category: "cctv",
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1.jpeg",
    name: "IP Camera System",
    description: "PoE network cameras, cloud storage ready",
    price: "₹3,000 – ₹10,000",
    category: "cctv",
  },
];

const computerProducts: Product[] = [
  {
    icon: <Monitor className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1-2.jpeg",
    name: "Desktop PC",
    description: "Assembled & branded desktops for home & office use",
    price: "₹18,000 – ₹55,000",
    category: "computer",
  },
  {
    icon: <Laptop className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1-2.jpeg",
    name: "Laptop",
    description: "Sales, repair & upgrade service for all brands",
    price: "₹20,000 – ₹80,000",
    category: "computer",
  },
  {
    icon: <Network className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1-2.jpeg",
    name: "Networking",
    description: "Routers, switches, LAN/WiFi setup for offices",
    price: "₹1,500 – ₹8,000",
    category: "computer",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    image: "/assets/uploads/WhatsApp-Image-2026-03-06-at-8.25.11-PM-1-2.jpeg",
    name: "UPS & Accessories",
    description: "Power backup, keyboard, mouse, cables",
    price: "₹800 – ₹5,000",
    category: "computer",
  },
];

// ─── Star Rating Display ───────────────────────────────────────────────────

function StarDisplay({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "lg" }) {
  const starSize = size === "lg" ? "text-2xl" : "text-sm";
  return (
    <span
      className={`inline-flex gap-0.5 ${starSize}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= rating ? "oklch(0.78 0.15 85)" : "oklch(0.82 0.03 240)",
          }}
        >
          {i <= rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

// ─── Enquiry Modal ─────────────────────────────────────────────────────────

function EnquiryModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productInterest, setProductInterest] = useState(product?.name ?? "");
  const [message, setMessage] = useState("");
  const submitMutation = useSubmitServiceRequest();

  // Sync product name when product changes
  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setName("");
      setPhone("");
      setMessage("");
    } else {
      setProductInterest(product?.name ?? "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    const description = message.trim()
      ? `Product Enquiry: ${productInterest} - ${message}`
      : `Product Enquiry: ${productInterest}`;
    try {
      const result = await submitMutation.mutateAsync({
        customerName: name.trim(),
        phone: phone.trim(),
        serviceType:
          product?.category === "computer"
            ? ServiceType.computer
            : ServiceType.cctv,
        problemDescription: description,
      });
      toast.success("Enquiry submitted! We'll contact you soon.");

      // Send WhatsApp notification to admin
      const serviceId = `KIT-${String(result).padStart(4, "0")}`;
      const categoryLabel =
        product?.category === "computer" ? "Computer" : "CCTV";
      const msgNote = message.trim()
        ? `💬 *Message:* ${message.trim()}\n\n`
        : "\n";
      const waMsg = encodeURIComponent(
        `🔔 *New Product Enquiry - ${serviceId}*\n\n👤 *Customer:* ${name.trim()}\n📞 *Phone:* ${phone.trim()}\n📦 *Product:* ${productInterest} (${categoryLabel})\n${msgNote}Please login to admin dashboard to respond.`,
      );
      window.open(`https://wa.me/917373713213?text=${waMsg}`, "_blank");

      onClose();
      setName("");
      setPhone("");
      setMessage("");
    } catch {
      toast.error("Failed to submit enquiry. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="products.enquiry.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-lg">
            Product Enquiry
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-name" className="text-sm font-medium">
              Your Name *
            </Label>
            <Input
              id="enquiry-name"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="products.enquiry.name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="enquiry-phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              data-ocid="products.enquiry.phone_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-product" className="text-sm font-medium">
              Product Interest
            </Label>
            <Input
              id="enquiry-product"
              value={productInterest}
              onChange={(e) => setProductInterest(e.target.value)}
              data-ocid="products.enquiry.product_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enquiry-message" className="text-sm font-medium">
              Message (optional)
            </Label>
            <Textarea
              id="enquiry-message"
              placeholder="Any specific requirements or questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
              data-ocid="products.enquiry.textarea"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="products.enquiry.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={submitMutation.isPending}
              data-ocid="products.enquiry.submit_button"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Enquiry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEnquire,
}: {
  product: Product;
  onEnquire: (p: Product) => void;
}) {
  const isCCTV = product.category === "cctv";
  const hue = isCCTV ? "170" : "220";

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-border bg-card flex flex-col overflow-hidden hover:shadow-elevated transition-all duration-300 isolate"
      style={{
        borderColor: `oklch(0.88 0.04 ${hue})`,
      }}
    >
      {/* Product Image */}
      {product.image && (
        <div
          className="w-full h-40 overflow-hidden flex-shrink-0"
          style={{ background: `oklch(0.95 0.03 ${hue} / 0.5)` }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: `oklch(0.92 0.07 ${hue} / 0.7)`,
              color: `oklch(0.4 0.15 ${hue})`,
            }}
          >
            {product.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground leading-tight">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span
            className="text-xs font-semibold"
            style={{ color: `oklch(0.45 0.15 ${hue})` }}
          >
            {product.price}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-3"
            onClick={() => onEnquire(product)}
            style={{
              borderColor: `oklch(0.78 0.1 ${hue})`,
              color: `oklch(0.45 0.15 ${hue})`,
            }}
            data-ocid="products.enquiry.open_modal_button"
          >
            Enquire Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Static Testimonials ───────────────────────────────────────────────────

const staticTestimonials = [
  {
    name: "Ravi Kumar",
    rating: 5,
    comment: "Excellent CCTV installation service. Very professional team.",
    initials: "RK",
  },
  {
    name: "Priya S",
    rating: 5,
    comment: "Computer repair done quickly. Great service at good price.",
    initials: "PS",
  },
  {
    name: "Murugan T",
    rating: 4,
    comment: "Good products and after-sales support. Recommended.",
    initials: "MT",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────

type ProductCategory = "all" | "cctv" | "computer";

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [productCategory, setProductCategory] =
    useState<ProductCategory>("all");
  const { data: averageRating } = useAverageRating();

  const handleEnquire = (product: Product) => {
    setEnquiryProduct(product);
    setEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
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

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-32 bg-grid">
          {/* Background logo watermark */}
          <img
            src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
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
                  src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
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

        {/* Products Section */}
        <section
          className="relative py-16 border-t border-border/50"
          style={{ isolation: "isolate" }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
              className="text-center mb-8"
            >
              <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                Our Products
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Quality CCTV cameras, computer systems, and networking equipment
                at competitive prices.
              </p>
            </motion.div>

            {/* Category filter bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex justify-center gap-2 mb-8"
            >
              {(
                [
                  { value: "all", label: "All", icon: null },
                  {
                    value: "cctv",
                    label: "CCTV",
                    icon: <Camera className="w-3.5 h-3.5" />,
                  },
                  {
                    value: "computer",
                    label: "Computer",
                    icon: <Cpu className="w-3.5 h-3.5" />,
                  },
                ] as const
              ).map(({ value, label, icon }) => {
                const isActive = productCategory === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setProductCategory(value)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200"
                    style={
                      isActive
                        ? {
                            borderColor: "oklch(0.62 0.17 220)",
                            color: "oklch(0.35 0.15 220)",
                            background: "oklch(0.92 0.06 220 / 0.4)",
                            transform: "scale(1.05)",
                          }
                        : {
                            borderColor: "oklch(0.88 0.015 240)",
                            color: "oklch(0.52 0.02 240)",
                            background: "oklch(0.97 0.008 240)",
                          }
                    }
                    data-ocid="products.filter.tab"
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </motion.div>

            {/* CCTV Products */}
            {(productCategory === "all" || productCategory === "cctv") && (
              <div className="mb-10">
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 mb-4"
                >
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "oklch(0.92 0.07 170 / 0.6)",
                      color: "oklch(0.38 0.14 170)",
                      border: "1px solid oklch(0.78 0.1 170)",
                    }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    CCTV Products
                  </span>
                </motion.div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                >
                  {cctvProducts.map((product) => (
                    <ProductCard
                      key={product.name}
                      product={product}
                      onEnquire={handleEnquire}
                    />
                  ))}
                </motion.div>
              </div>
            )}

            {/* Computer Products */}
            {(productCategory === "all" || productCategory === "computer") && (
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 mb-4"
                >
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "oklch(0.92 0.07 220 / 0.6)",
                      color: "oklch(0.38 0.14 220)",
                      border: "1px solid oklch(0.78 0.1 220)",
                    }}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Computer Products
                  </span>
                </motion.div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                >
                  {computerProducts.map((product) => (
                    <ProductCard
                      key={product.name}
                      product={product}
                      onEnquire={handleEnquire}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* Services grid */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                Our Services
              </h2>
            </motion.div>
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

        {/* Reviews Section */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                What Our Customers Say
              </h2>
              {averageRating && averageRating > 0 ? (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span
                    className="text-4xl font-bold font-display"
                    style={{ color: "oklch(0.62 0.17 220)" }}
                  >
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="text-left">
                    <StarDisplay rating={Math.round(averageRating)} size="lg" />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on customer feedback
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mt-2">
                  Trusted by customers across Thiruvarur
                </p>
              )}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {staticTestimonials.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "oklch(0.62 0.17 220)" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {t.name}
                      </p>
                      <StarDisplay rating={t.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{t.comment}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
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

      {/* Enquiry Modal */}
      <AnimatePresence>
        {enquiryOpen && (
          <EnquiryModal
            product={enquiryProduct}
            open={enquiryOpen}
            onClose={() => setEnquiryOpen(false)}
          />
        )}
      </AnimatePresence>
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
