import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Cpu,
  Fingerprint,
  Loader2,
  LogIn,
  LogOut,
  MessageCircle,
  Phone,
  Search,
  Send,
  Shield,
  ShoppingBag,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ServiceType, Status } from "../backend.d";
import type { Customer, ServiceRequest } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddCustomer,
  useAllServiceRequests,
  useCustomers,
  useNewRequestsCount,
  useReplyToServiceRequest,
  useReviews,
  useUpdateServiceRequestStatus,
} from "../hooks/useQueries";
import { ServiceTypeBadge, StatusBadge } from "./StatusBadge";

interface AdminDashboardProps {
  onBack: () => void;
}

type FilterStatus = "all" | Status;
type FilterService = "all" | ServiceType | "enquiry";
type AdminSection = "requests" | "enquiries" | "customers" | "reviews";

function formatDate(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp) / 1_000_000;
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ADMIN_USERNAME = "kalaiinfotech";
const ADMIN_PASSWORD = "kalai@2024";

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const { data: newCount } = useNewRequestsCount();
  const notificationCount = newCount ? Number(newCount) : 0;

  const handleLogout = () => {
    clear();
    setPasswordVerified(false);
    setIsLoggedIn(false);
  };

  if (!passwordVerified) {
    return (
      <LoginView
        onBack={onBack}
        onLoginSuccess={() => setPasswordVerified(true)}
      />
    );
  }

  if (!identity || !isLoggedIn) {
    return (
      <IILoginView
        onBack={() => setPasswordVerified(false)}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <AdminView
      onBack={onBack}
      onLogout={handleLogout}
      notificationCount={notificationCount}
    />
  );
}

function LoginView({
  onBack,
  onLoginSuccess,
}: {
  onBack: () => void;
  onLoginSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    // Simulate a brief loading state
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLoginSuccess();
    } else {
      setError("Invalid username or password");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
              alt="KALAI INFO TECH"
              className="h-7 w-auto object-contain"
            />
            <span className="font-display font-semibold text-base">
              Admin Login
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-8 shadow-card"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: "oklch(0.62 0.17 220)",
                  color: "white",
                }}
              >
                1
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.45 0.15 220)" }}
              >
                Password
              </span>
            </div>
            <div
              className="flex-1 h-0.5 max-w-[40px] rounded"
              style={{ background: "oklch(0.88 0.04 220)" }}
            />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold bg-muted text-muted-foreground">
                2
              </div>
              <span className="text-xs text-muted-foreground">Identity</span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
              alt="KALAI INFO TECH"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2 text-center">
            Admin Access
          </h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed text-center">
            Enter your credentials to access the admin dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                data-ocid="admin.username_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                data-ocid="admin.password_input"
              />
            </div>

            {error && (
              <p
                className="text-sm text-destructive font-medium"
                data-ocid="admin.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full gap-2 font-semibold"
              disabled={isSubmitting}
              data-ocid="admin.login_submit_button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

function IILoginView({
  onBack,
  onLoginSuccess,
}: {
  onBack: () => void;
  onLoginSuccess: () => void;
}) {
  const { login, identity, isLoggingIn, isLoginError } = useInternetIdentity();

  // When II identity becomes available, automatically proceed
  useEffect(() => {
    if (identity) {
      onLoginSuccess();
    }
  }, [identity, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
              alt="KALAI INFO TECH"
              className="h-7 w-auto object-contain"
            />
            <span className="font-display font-semibold text-base">
              Admin Login
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-8 shadow-card"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: "oklch(0.55 0.15 148)",
                  color: "white",
                }}
              >
                ✓
              </div>
              <span className="text-xs text-muted-foreground">Password</span>
            </div>
            <div
              className="flex-1 h-0.5 max-w-[40px] rounded"
              style={{ background: "oklch(0.62 0.17 220)" }}
            />
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: "oklch(0.62 0.17 220)",
                  color: "white",
                }}
              >
                2
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.45 0.15 220)" }}
              >
                Identity
              </span>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
              alt="KALAI INFO TECH"
              className="h-16 w-auto object-contain"
            />
          </div>

          <h1 className="font-display font-bold text-2xl text-foreground mb-2 text-center">
            Connect Identity
          </h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed text-center">
            Connect your Internet Identity to securely access admin features.
            This is a one-time setup.
          </p>

          {isLoginError && (
            <div
              className="rounded-lg p-3 mb-4 text-sm text-center font-medium"
              style={{
                background: "oklch(0.95 0.04 25 / 0.5)",
                color: "oklch(0.45 0.18 25)",
                border: "1px solid oklch(0.85 0.1 25)",
              }}
              data-ocid="admin.error_state"
            >
              Connection failed. Please try again.
            </div>
          )}

          <Button
            onClick={login}
            className="w-full gap-2 font-semibold"
            disabled={isLoggingIn}
            data-ocid="admin.ii_connect_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4" />
                Connect with Internet Identity
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5"
            data-ocid="admin.back_button"
          >
            ← Back to password
          </button>
        </motion.div>
      </main>
    </div>
  );
}

function AdminView({
  onBack,
  onLogout,
  notificationCount,
}: {
  onBack: () => void;
  onLogout: () => void;
  notificationCount: number;
}) {
  const [section, setSection] = useState<AdminSection>("requests");

  return (
    <div
      className="min-h-screen bg-background"
      data-ocid="admin.dashboard_section"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <img
                src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
                alt="KALAI INFO TECH"
                className="h-7 w-auto object-contain"
              />
              <span className="font-display font-semibold text-base">
                Admin Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification badge */}
            <div className="relative" data-ocid="admin.notification_badge">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                  style={{ background: "oklch(0.55 0.22 25)" }}
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSection("requests")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                section === "requests"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.filter.tab"
            >
              <ClipboardList className="w-4 h-4" />
              Service Requests
            </button>
            <button
              type="button"
              onClick={() => setSection("enquiries")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                section === "enquiries"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.filter.tab"
            >
              <MessageCircle className="w-4 h-4" />
              Enquiries
            </button>
            <button
              type="button"
              onClick={() => setSection("customers")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                section === "customers"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.filter.tab"
            >
              <Users className="w-4 h-4" />
              Customers
            </button>
            <button
              type="button"
              onClick={() => setSection("reviews")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                section === "reviews"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.filter.tab"
            >
              <Star className="w-4 h-4" />
              Reviews
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {section === "requests" ? (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RequestsSection />
            </motion.div>
          ) : section === "enquiries" ? (
            <motion.div
              key="enquiries"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EnquiriesSection />
            </motion.div>
          ) : section === "customers" ? (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CustomersSection />
            </motion.div>
          ) : (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function RequestsSection() {
  const { data: requests, isLoading } = useAllServiceRequests();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [serviceFilter, setServiceFilter] = useState<FilterService>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<bigint | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<string, Status>>(
    {},
  );

  const isEnquiry = (r: ServiceRequest) =>
    r.problemDescription.startsWith("Product Enquiry:");

  const replyMutation = useReplyToServiceRequest();
  const statusMutation = useUpdateServiceRequestStatus();

  // Only real service calls (exclude enquiries)
  const serviceCalls = (requests ?? []).filter((r) => !isEnquiry(r));

  const filtered = serviceCalls.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (serviceFilter !== "all" && r.serviceType !== serviceFilter)
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !r.customerName.toLowerCase().includes(q) &&
        !r.phone.includes(q) &&
        !r.problemDescription.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // Sort: unread first, then by date desc
  const sorted = [...filtered].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return Number(b.submittedAt - a.submittedAt);
  });

  const handleSendReply = async (req: ServiceRequest) => {
    const key = req.requestId.toString();
    const reply = replyText[key]?.trim();
    if (!reply) {
      toast.error("Please enter a reply message");
      return;
    }
    try {
      await replyMutation.mutateAsync({ requestId: req.requestId, reply });
      toast.success("Reply sent successfully!");
      setReplyText((prev) => ({ ...prev, [key]: "" }));
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleStatusChange = async (req: ServiceRequest, status: Status) => {
    const key = req.requestId.toString();
    setSelectedStatus((prev) => ({ ...prev, [key]: status }));
    try {
      await statusMutation.mutateAsync({ requestId: req.requestId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.loading_state"
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading service requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Service Calls ({serviceCalls.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            CCTV & Computer service requests
          </p>
        </div>
      </div>

      {/* Search + service type filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
            data-ocid="admin.search_input"
          />
        </div>
        <Select
          value={serviceFilter}
          onValueChange={(v) => setServiceFilter(v as FilterService)}
        >
          <SelectTrigger
            className="h-9 w-full sm:w-40"
            data-ocid="admin.request.status_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value={ServiceType.cctv}>CCTV Only</SelectItem>
            <SelectItem value={ServiceType.computer}>Computer Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(
          [
            {
              value: "all",
              label: "All",
              activeStyle: {
                borderColor: "oklch(0.62 0.17 220)",
                color: "oklch(0.35 0.15 220)",
                background: "oklch(0.92 0.06 220 / 0.3)",
              },
            },
            {
              value: Status.pending,
              label: "Pending",
              activeStyle: {
                borderColor: "oklch(0.78 0.16 75)",
                color: "oklch(0.42 0.14 65)",
                background: "oklch(0.96 0.06 75 / 0.6)",
              },
            },
            {
              value: Status.inProgress,
              label: "Open",
              activeStyle: {
                borderColor: "oklch(0.62 0.17 220)",
                color: "oklch(0.35 0.15 220)",
                background: "oklch(0.92 0.06 220 / 0.5)",
              },
            },
            {
              value: Status.completed,
              label: "Closed",
              activeStyle: {
                borderColor: "oklch(0.72 0.16 148)",
                color: "oklch(0.38 0.13 148)",
                background: "oklch(0.92 0.06 148 / 0.5)",
              },
            },
          ] as const
        ).map(({ value, label, activeStyle }) => {
          const count =
            value === "all"
              ? serviceCalls.length
              : serviceCalls.filter((r) => r.status === value).length;
          const isActive = statusFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value as FilterStatus)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
              style={
                isActive
                  ? {
                      ...activeStyle,
                      transform: "scale(1.05)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }
                  : {
                      borderColor: "oklch(0.88 0.015 240)",
                      color: "oklch(0.52 0.02 240)",
                      background: "oklch(0.97 0.008 240)",
                    }
              }
              data-ocid="admin.filter.tab"
            >
              {label}
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{
                  background: isActive
                    ? "oklch(1 0 0 / 0.6)"
                    : "oklch(0.94 0.01 240)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests table/list */}
      {sorted.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-12 text-center"
          data-ocid="admin.requests_table"
        >
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.empty_state"
          >
            No requests match the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.requests_table">
          {sorted.map((req, idx) => {
            const key = req.requestId.toString();
            const isExpanded = expandedId === req.requestId;
            const currentStatus = selectedStatus[key] ?? req.status;
            const currentReply = replyText[key] ?? "";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border bg-card shadow-xs overflow-hidden"
                style={{
                  borderColor: !req.isRead ? "oklch(0.75 0.1 220)" : undefined,
                }}
                data-ocid={`admin.request.item.${idx + 1}`}
              >
                {/* Row header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : req.requestId)
                  }
                  className="w-full p-4 text-left hover:bg-accent/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      {isEnquiry(req) && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: "oklch(0.92 0.08 60 / 0.3)",
                            color: "oklch(0.45 0.15 60)",
                            border: "1px solid oklch(0.78 0.12 60)",
                          }}
                        >
                          ENQUIRY
                        </span>
                      )}
                      <ServiceTypeBadge serviceType={req.serviceType} />
                      <StatusBadge status={req.status} />
                      {!req.isRead && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: "oklch(0.62 0.17 220 / 0.12)",
                            color: "oklch(0.45 0.15 220)",
                            border: "1px solid oklch(0.75 0.1 220)",
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-foreground">
                        {req.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.phone}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(req.submittedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">#{key}</p>
                    </div>
                    <div className="text-muted-foreground">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 truncate">
                    {req.problemDescription}
                  </p>
                </button>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t border-border/50 space-y-4">
                        {/* Full details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                              Customer
                            </p>
                            <p className="font-medium">{req.customerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                              Phone
                            </p>
                            <p className="font-medium">{req.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                              Submitted
                            </p>
                            <p className="font-medium">
                              {formatDate(req.submittedAt)}
                            </p>
                          </div>
                          {req.repliedAt && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                                Replied
                              </p>
                              <p className="font-medium">
                                {formatDate(req.repliedAt)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Problem
                          </p>
                          <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">
                            {req.problemDescription}
                          </p>
                        </div>

                        {/* Status update */}
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-medium text-nowrap">
                            Update Status:
                          </Label>
                          <Select
                            value={currentStatus}
                            onValueChange={(v) =>
                              handleStatusChange(req, v as Status)
                            }
                          >
                            <SelectTrigger
                              className="h-8 w-40"
                              data-ocid="admin.request.status_select"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value={Status.pending}>
                                Pending
                              </SelectItem>
                              <SelectItem value={Status.inProgress}>
                                In Progress
                              </SelectItem>
                              <SelectItem value={Status.completed}>
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {statusMutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                        </div>

                        {/* WhatsApp notification button */}
                        <a
                          href={`https://wa.me/${req.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `வணக்கம் ${req.customerName}! உங்கள் service request #${req.requestId} status update: ${currentStatus === "pending" ? "Pending - பரிசீலனையில் உள்ளது" : currentStatus === "inProgress" ? "In Progress - பணி நடைபெறுகிறது" : "Completed - பணி முடிந்தது"}. நன்றி - KALAI INFO TECH, 7373713213`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid="admin.request.whatsapp_button"
                          className="inline-flex items-center gap-2 rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Send WhatsApp
                        </a>

                        {/* Existing reply */}
                        {req.adminReply && (
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: "oklch(0.92 0.06 148 / 0.3)",
                              border: "1px solid oklch(0.78 0.1 148)",
                            }}
                          >
                            <p
                              className="text-xs font-semibold uppercase tracking-wider mb-1"
                              style={{ color: "oklch(0.4 0.13 148)" }}
                            >
                              Your Previous Reply
                            </p>
                            <p className="text-sm text-foreground">
                              {req.adminReply}
                            </p>
                          </div>
                        )}

                        {/* Reply area */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            {req.adminReply
                              ? "Update Reply"
                              : "Send Reply to Customer"}
                          </Label>
                          <Textarea
                            placeholder="Type your reply to the customer..."
                            value={currentReply}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            rows={3}
                            className="resize-none"
                            data-ocid="admin.request.reply_textarea"
                          />
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleSendReply(req)}
                            disabled={replyMutation.isPending}
                            data-ocid="admin.request.reply_button"
                          >
                            {replyMutation.isPending ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                {req.adminReply ? "Update Reply" : "Send Reply"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EnquiriesSection() {
  const { data: requests, isLoading } = useAllServiceRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const replyMutation = useReplyToServiceRequest();
  const statusMutation = useUpdateServiceRequestStatus();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<bigint | null>(null);

  const isEnquiry = (r: ServiceRequest) =>
    r.problemDescription.startsWith("Product Enquiry:");

  const allEnquiries = (requests ?? []).filter(isEnquiry);

  const enquiries = allEnquiries
    .filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.problemDescription.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => Number(b.submittedAt - a.submittedAt));

  const parseEnquiryDetails = (desc: string) => {
    // Format: "Product Enquiry: <ProductName> - <Message>" or "Product Enquiry: <ProductName>"
    const withoutPrefix = desc.replace("Product Enquiry: ", "");
    const dashIdx = withoutPrefix.indexOf(" - ");
    if (dashIdx !== -1) {
      return {
        product: withoutPrefix.substring(0, dashIdx),
        message: withoutPrefix.substring(dashIdx + 3),
      };
    }
    return { product: withoutPrefix, message: "" };
  };

  const handleSendReply = async (req: ServiceRequest) => {
    const key = req.requestId.toString();
    const reply = replyText[key]?.trim();
    if (!reply) {
      toast.error("Please enter a reply message");
      return;
    }
    try {
      await replyMutation.mutateAsync({ requestId: req.requestId, reply });
      toast.success("Reply sent!");
      setReplyText((prev) => ({ ...prev, [key]: "" }));
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleMarkContacted = async (req: ServiceRequest) => {
    try {
      await statusMutation.mutateAsync({
        requestId: req.requestId,
        status: Status.inProgress,
      });
      toast.success("Marked as Contacted");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleMarkClosed = async (req: ServiceRequest) => {
    try {
      await statusMutation.mutateAsync({
        requestId: req.requestId,
        status: Status.completed,
      });
      toast.success("Enquiry closed");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.enquiries.loading_state"
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading enquiries...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Customer Enquiries ({allEnquiries.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Product enquiries submitted by customers
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(
          [
            {
              value: "all",
              label: "All",
              activeStyle: {
                borderColor: "oklch(0.62 0.17 220)",
                color: "oklch(0.35 0.15 220)",
                background: "oklch(0.92 0.06 220 / 0.3)",
              },
            },
            {
              value: Status.pending,
              label: "Pending",
              activeStyle: {
                borderColor: "oklch(0.78 0.16 75)",
                color: "oklch(0.42 0.14 65)",
                background: "oklch(0.96 0.06 75 / 0.6)",
              },
            },
            {
              value: Status.inProgress,
              label: "Contacted",
              activeStyle: {
                borderColor: "oklch(0.62 0.17 220)",
                color: "oklch(0.35 0.15 220)",
                background: "oklch(0.92 0.06 220 / 0.5)",
              },
            },
            {
              value: Status.completed,
              label: "Closed",
              activeStyle: {
                borderColor: "oklch(0.72 0.16 148)",
                color: "oklch(0.38 0.13 148)",
                background: "oklch(0.92 0.06 148 / 0.5)",
              },
            },
          ] as const
        ).map(({ value, label, activeStyle }) => {
          const count =
            value === "all"
              ? allEnquiries.length
              : allEnquiries.filter((r) => r.status === value).length;
          const isActive = statusFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value as FilterStatus)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
              style={
                isActive
                  ? {
                      ...activeStyle,
                      transform: "scale(1.05)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }
                  : {
                      borderColor: "oklch(0.88 0.015 240)",
                      color: "oklch(0.52 0.02 240)",
                      background: "oklch(0.97 0.008 240)",
                    }
              }
              data-ocid="admin.enquiries.filter.tab"
            >
              {label}
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{
                  background: isActive
                    ? "oklch(1 0 0 / 0.6)"
                    : "oklch(0.94 0.01 240)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9"
          data-ocid="admin.enquiries.search_input"
        />
      </div>

      {enquiries.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-14 text-center"
          data-ocid="admin.enquiries.empty_state"
        >
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No enquiries match the current filters."
              : "No product enquiries yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.enquiries.list">
          {enquiries.map((req, idx) => {
            const key = req.requestId.toString();
            const { product, message } = parseEnquiryDetails(
              req.problemDescription,
            );
            const isExpanded = expandedId === req.requestId;
            const currentReply = replyText[key] ?? "";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border bg-card shadow-xs overflow-hidden"
                style={{
                  borderColor:
                    req.status === Status.pending
                      ? "oklch(0.78 0.12 60)"
                      : req.status === Status.inProgress
                        ? "oklch(0.78 0.12 220)"
                        : undefined,
                }}
                data-ocid={`admin.enquiries.item.${idx + 1}`}
              >
                {/* Card header - always visible */}
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Customer avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: "oklch(0.55 0.18 220)" }}
                    >
                      {req.customerName.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground">
                          {req.customerName}
                        </p>
                        <StatusBadge status={req.status} />
                        {!req.isRead && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              background: "oklch(0.62 0.17 220 / 0.12)",
                              color: "oklch(0.45 0.15 220)",
                              border: "1px solid oklch(0.75 0.1 220)",
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <a
                          href={`tel:${req.phone}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {req.phone}
                        </a>
                      </div>

                      {/* Product enquired */}
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: "oklch(0.92 0.07 60 / 0.3)",
                          color: "oklch(0.4 0.14 60)",
                          border: "1px solid oklch(0.82 0.1 60)",
                        }}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {product}
                      </div>

                      {message && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {message}
                        </p>
                      )}

                      {/* Submitted time */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(req.submittedAt)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${req.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `வணக்கம் ${req.customerName}! நீங்கள் "${product}" பற்றி enquiry செய்தீர்கள். உங்களுக்கு விரைவில் தெரிவிக்கிறோம். நன்றி - KALAI INFO TECH, 7373713213`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                        data-ocid="admin.enquiries.whatsapp_button"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>

                      {req.status === Status.pending && (
                        <button
                          type="button"
                          onClick={() => handleMarkContacted(req)}
                          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            borderColor: "oklch(0.75 0.1 220)",
                            color: "oklch(0.45 0.15 220)",
                            background: "oklch(0.95 0.04 220 / 0.4)",
                          }}
                          data-ocid="admin.enquiries.contact_button"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Contacted
                        </button>
                      )}

                      {req.status === Status.inProgress && (
                        <button
                          type="button"
                          onClick={() => handleMarkClosed(req)}
                          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{
                            borderColor: "oklch(0.75 0.1 148)",
                            color: "oklch(0.4 0.13 148)",
                            background: "oklch(0.95 0.04 148 / 0.4)",
                          }}
                          data-ocid="admin.enquiries.close_button"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Close
                        </button>
                      )}

                      {/* Expand for reply */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : req.requestId)
                        }
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        data-ocid="admin.enquiries.reply_toggle_button"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-2">
                        {req.adminReply && (
                          <div
                            className="rounded-lg p-2.5 text-sm"
                            style={{
                              background: "oklch(0.93 0.05 148 / 0.3)",
                              border: "1px solid oklch(0.78 0.1 148)",
                            }}
                          >
                            <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                              Previous reply:
                            </p>
                            <p>{req.adminReply}</p>
                          </div>
                        )}
                        <Textarea
                          placeholder="Type a reply to send to the customer..."
                          value={currentReply}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="resize-none text-sm"
                          data-ocid="admin.enquiries.reply_textarea"
                        />
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSendReply(req)}
                          disabled={replyMutation.isPending}
                          data-ocid="admin.enquiries.send_reply_button"
                        >
                          {replyMutation.isPending ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="text-base"
          style={{
            color: i <= rating ? "oklch(0.78 0.15 85)" : "oklch(0.82 0.03 240)",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewsSection() {
  const { data: reviews, isLoading } = useReviews();

  const totalReviews = (reviews ?? []).length;
  const avgRating =
    totalReviews > 0
      ? (reviews ?? []).reduce((sum, r) => sum + Number(r.rating), 0) /
        totalReviews
      : 0;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.reviews.loading_state"
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary card */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div
          className="flex-1 rounded-xl border p-5"
          style={{
            background: "oklch(0.96 0.04 85 / 0.4)",
            borderColor: "oklch(0.82 0.1 85)",
          }}
          data-ocid="admin.reviews.panel"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Reviews
          </p>
          <p
            className="font-display font-bold text-3xl"
            style={{ color: "oklch(0.5 0.15 85)" }}
          >
            {totalReviews}
          </p>
        </div>
        <div
          className="flex-1 rounded-xl border p-5"
          style={{
            background: "oklch(0.96 0.04 85 / 0.4)",
            borderColor: "oklch(0.82 0.1 85)",
          }}
          data-ocid="admin.reviews.panel"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Average Rating
          </p>
          <div className="flex items-center gap-2">
            <p
              className="font-display font-bold text-3xl"
              style={{ color: "oklch(0.5 0.15 85)" }}
            >
              {totalReviews > 0 ? avgRating.toFixed(1) : "—"}
            </p>
            {totalReviews > 0 && <StarDisplay rating={Math.round(avgRating)} />}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {totalReviews === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-12 text-center"
          data-ocid="admin.reviews.empty_state"
        >
          <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No reviews yet. Reviews will appear here once customers rate their
            service.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.reviews.list">
          {(reviews ?? []).map((review, idx) => (
            <motion.div
              key={review.reviewId.toString()}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-xl border border-border bg-card p-4 shadow-xs"
              data-ocid={`admin.reviews.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {review.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.phone}
                  </p>
                </div>
                <div className="text-right">
                  <StarDisplay rating={Number(review.rating)} />
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Request #{review.requestId.toString()}
                  </p>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 rounded-lg p-2.5">
                  "{review.comment}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(
                  Number(review.submittedAt) / 1_000_000,
                ).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomersSection() {
  const { data: customers, isLoading } = useCustomers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (customers ?? []).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Customers ({(customers ?? []).length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage registered customers
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setShowAddDialog(true)}
          data-ocid="admin.add_customer_button"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Customer
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9"
          data-ocid="admin.search_input"
        />
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-12"
          data-ocid="admin.loading_state"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading customers...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-12 text-center"
          data-ocid="admin.empty_state"
        >
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "No customers match your search."
              : "No customers registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((customer, idx) => (
            <CustomerCard key={customer.phone} customer={customer} idx={idx} />
          ))}
        </div>
      )}

      <AddCustomerDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}

function CustomerCard({ customer, idx }: { customer: Customer; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-xl border border-border bg-card p-4 shadow-xs"
      data-ocid={`admin.request.item.${idx + 1}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-sm text-foreground">
            {customer.name}
          </p>
          <p className="text-xs text-muted-foreground">{customer.phone}</p>
        </div>
        <ServiceTypeBadge serviceType={customer.serviceType} />
      </div>
      {customer.address && (
        <p className="text-xs text-muted-foreground truncate">
          {customer.address}
        </p>
      )}
    </motion.div>
  );
}

function AddCustomerDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");

  const addCustomer = useAddCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !serviceType) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await addCustomer.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        serviceType: serviceType as ServiceType,
      });
      toast.success("Customer added successfully!");
      setName("");
      setPhone("");
      setAddress("");
      setServiceType("");
      onClose();
    } catch {
      toast.error("Failed to add customer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="admin.dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Name *</Label>
            <Input
              placeholder="Customer full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="customer.name_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Phone *</Label>
            <Input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              data-ocid="customer.phone_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Address</Label>
            <Input
              placeholder="Customer address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Service Type *</Label>
            <Select
              value={serviceType}
              onValueChange={(v) => setServiceType(v as ServiceType)}
            >
              <SelectTrigger data-ocid="customer.service_type_select">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={ServiceType.cctv}>
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    CCTV
                  </span>
                </SelectItem>
                <SelectItem value={ServiceType.computer}>
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Computer
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addCustomer.isPending}
              className="gap-2"
              data-ocid="admin.confirm_button"
            >
              {addCustomer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Add Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
