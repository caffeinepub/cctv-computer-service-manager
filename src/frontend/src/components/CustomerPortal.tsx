import { Button } from "@/components/ui/button";
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
  BellDot,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Loader2,
  Search,
  Send,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ServiceType, Status } from "../backend.d";
import type { ServiceRequest } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useCustomerServiceRequests,
  useMarkRequestAsRead,
  useReviewByRequestId,
  useSubmitReview,
  useSubmitServiceRequest,
} from "../hooks/useQueries";
import { ServiceTypeBadge, StatusBadge } from "./StatusBadge";

interface CustomerPortalProps {
  onBack: () => void;
}

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

export default function CustomerPortal({ onBack }: CustomerPortalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedServiceId, setSubmittedServiceId] = useState<bigint | null>(
    null,
  );

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [problem, setProblem] = useState("");

  // Track state
  const [trackPhone, setTrackPhone] = useState("");
  const [activeTrackPhone, setActiveTrackPhone] = useState("");

  const submitMutation = useSubmitServiceRequest();
  const { actor, isFetching: isActorLoading } = useActor();

  // Connection timeout: after 12s of still connecting, allow "Submit Anyway"
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  useEffect(() => {
    if (!isActorLoading) {
      setConnectionTimeout(false);
      return;
    }
    const timer = setTimeout(() => {
      setConnectionTimeout(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [isActorLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !serviceType || !problem.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!actor) {
      toast.error("Still connecting, please wait a moment and try again.");
      return;
    }
    try {
      const result = await submitMutation.mutateAsync({
        customerName: name.trim(),
        phone: phone.trim(),
        serviceType: serviceType as ServiceType,
        problemDescription: problem.trim(),
      });
      setSubmittedServiceId(result);
      toast.success("Service request submitted successfully!");

      // Send WhatsApp notification to admin
      const serviceLabel =
        serviceType === ServiceType.cctv
          ? "CCTV Sales & Service"
          : "Computer Sales & Service";
      const serviceId = `KIT-${String(result).padStart(4, "0")}`;
      const waMsg = encodeURIComponent(
        `🔔 *New Service Request - ${serviceId}*\n\n👤 *Customer:* ${name.trim()}\n📞 *Phone:* ${phone.trim()}\n🛠 *Service:* ${serviceLabel}\n📝 *Problem:* ${problem.trim()}\n\nPlease login to admin dashboard to respond.`,
      );
      window.open(`https://wa.me/917373713213?text=${waMsg}`, "_blank");

      setSubmitted(true);
      setActiveTrackPhone(phone.trim());
      setTrackPhone(phone.trim());
    } catch {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setActiveTrackPhone(trackPhone.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/cctv-surveillance-security-camera-monitoring-inside-shield-vector-logo-design-template-141930796-copy-1.jpg"
              alt="KALAI INFO TECH"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Submit Request Form */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl text-foreground mb-1">
                  Log a Service Request
                </h1>
                <p className="text-muted-foreground text-sm">
                  Describe your issue and we'll get back to you promptly.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-border bg-card p-6 space-y-5 shadow-card"
              >
                <div className="space-y-2">
                  <Label htmlFor="cust-name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="cust-name"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="customer.name_input"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="cust-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-ocid="customer.phone_input"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-service" className="text-sm font-medium">
                    Service Type
                  </Label>
                  <Select
                    value={serviceType}
                    onValueChange={(v) => setServiceType(v as ServiceType)}
                  >
                    <SelectTrigger
                      id="cust-service"
                      className="h-10"
                      data-ocid="customer.service_type_select"
                    >
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={ServiceType.cctv}>
                        <span className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          CCTV Sales & Service
                        </span>
                      </SelectItem>
                      <SelectItem value={ServiceType.computer}>
                        <span className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          Computer Sales & Service
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-problem" className="text-sm font-medium">
                    Describe the Problem
                  </Label>
                  <Textarea
                    id="cust-problem"
                    placeholder="Please describe the issue in detail..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    data-ocid="customer.problem_textarea"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 font-semibold h-10"
                  disabled={
                    submitMutation.isPending || (!actor && !connectionTimeout)
                  }
                  data-ocid="customer.submit_button"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : !actor && !connectionTimeout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </Button>
                {connectionTimeout && !actor && (
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Connection delayed. Try submitting or reload the page.
                  </p>
                )}
              </form>
            </motion.section>
          ) : (
            <motion.section
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "oklch(0.92 0.06 148 / 0.8)" }}
                >
                  <CheckCircle2
                    className="w-7 h-7"
                    style={{ color: "oklch(0.5 0.15 148)" }}
                  />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground mb-2">
                  Request Submitted!
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Your service request has been logged. We'll review it shortly
                  and reply to you.
                </p>
                {submittedServiceId !== null && (
                  <div
                    className="rounded-lg p-4 mb-4 text-center"
                    style={{
                      background: "oklch(0.92 0.07 220 / 0.4)",
                      border: "1px solid oklch(0.75 0.12 220)",
                    }}
                    data-ocid="customer.service_id_panel"
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "oklch(0.45 0.15 220)" }}
                    >
                      Your Service ID
                    </p>
                    <p
                      className="font-display font-bold text-2xl"
                      style={{ color: "oklch(0.35 0.18 220)" }}
                    >
                      KIT-{String(submittedServiceId).padStart(4, "0")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save this ID to track your request
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setPhone("");
                    setServiceType("");
                    setProblem("");
                    setSubmittedServiceId(null);
                  }}
                >
                  Submit Another Request
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Track Requests */}
        <section>
          <div className="mb-4">
            <h2 className="font-display font-bold text-xl text-foreground mb-1">
              Track My Requests
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter your phone number to view all your service requests and
              replies.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex gap-2 mb-6">
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={trackPhone}
              onChange={(e) => setTrackPhone(e.target.value)}
              data-ocid="customer.track_phone_input"
              className="h-10 flex-1"
            />
            <Button
              type="submit"
              variant="outline"
              className="gap-2 h-10 px-4"
              data-ocid="customer.track_button"
            >
              <Search className="w-4 h-4" />
              Track
            </Button>
          </form>

          {activeTrackPhone && <RequestsList phone={activeTrackPhone} />}
        </section>
      </main>
    </div>
  );
}

// ─── Star Rating Input ────────────────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          style={{
            color:
              i <= (hovered || value)
                ? "oklch(0.78 0.15 85)"
                : "oklch(0.82 0.03 240)",
          }}
          aria-label={`${i} star${i !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────────

function ReviewForm({ requestId }: { requestId: bigint }) {
  const { data: existingReview, isLoading } = useReviewByRequestId(requestId);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading review...
      </div>
    );
  }

  if (existingReview) {
    return (
      <div
        className="rounded-lg p-3"
        style={{
          background: "oklch(0.95 0.06 85 / 0.3)",
          border: "1px solid oklch(0.82 0.1 85)",
        }}
        data-ocid="customer.review.success_state"
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "oklch(0.55 0.14 85)" }}
        >
          Your Review
        </p>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="text-lg"
              style={{
                color:
                  i <= Number(existingReview.rating)
                    ? "oklch(0.78 0.15 85)"
                    : "oklch(0.82 0.03 240)",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Thank you for your review! You rated us{" "}
          {Number(existingReview.rating)} stars.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      await submitReview.mutateAsync({
        requestId,
        rating: BigInt(rating),
        comment: comment.trim(),
      });
      toast.success("Thank you for your review!");
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <div
      className="rounded-lg p-3 space-y-3"
      style={{
        background: "oklch(0.96 0.01 240)",
        border: "1px solid oklch(0.88 0.015 240)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "oklch(0.45 0.08 240)" }}
      >
        Leave a Review
      </p>
      <StarRatingInput value={rating} onChange={setRating} />
      <Textarea
        placeholder="Share your experience (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="resize-none text-sm"
        data-ocid="customer.review.textarea"
      />
      <Button
        size="sm"
        className="gap-2"
        onClick={handleSubmit}
        disabled={submitReview.isPending || rating === 0}
        data-ocid="customer.review.submit_button"
      >
        {submitReview.isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Star className="w-3.5 h-3.5" />
            Submit Review
          </>
        )}
      </Button>
    </div>
  );
}

function RequestsList({ phone }: { phone: string }) {
  const {
    data: requests,
    isLoading,
    error,
  } = useCustomerServiceRequests(phone);
  const markAsRead = useMarkRequestAsRead();
  const [expandedId, setExpandedId] = useState<bigint | null>(null);

  const handleExpand = (req: ServiceRequest) => {
    const isOpening = expandedId !== req.requestId;
    setExpandedId(isOpening ? req.requestId : null);
    if (isOpening && req.hasNewReply && !req.isRead) {
      markAsRead.mutate({ requestId: req.requestId, phoneNumber: phone });
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12 rounded-xl border border-border bg-card"
        data-ocid="customer.requests_list"
      >
        <div
          className="flex items-center gap-3 text-muted-foreground"
          data-ocid="customer.loading_state"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
        data-ocid="customer.error_state"
      >
        <p className="text-sm text-destructive">
          Failed to load requests. Please try again.
        </p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-10 text-center"
        data-ocid="customer.requests_list"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: "oklch(0.94 0.01 240)" }}
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <p
          className="text-sm text-muted-foreground"
          data-ocid="customer.empty_state"
        >
          No service requests found for this phone number.
        </p>
      </div>
    );
  }

  const newReplyCount = requests.filter(
    (r) => r.hasNewReply && !r.isRead,
  ).length;

  return (
    <div data-ocid="customer.requests_list">
      {newReplyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 text-sm font-medium"
          style={{
            background: "oklch(0.95 0.06 220 / 0.6)",
            borderColor: "oklch(0.75 0.12 220)",
            color: "oklch(0.35 0.15 220)",
          }}
        >
          <BellDot className="w-4 h-4" />
          {newReplyCount} new {newReplyCount === 1 ? "reply" : "replies"} from
          admin
        </motion.div>
      )}

      <div className="space-y-3">
        {requests.map((req, idx) => (
          <motion.div
            key={req.requestId.toString()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-xl border bg-card shadow-xs overflow-hidden"
            style={{
              borderColor:
                req.hasNewReply && !req.isRead
                  ? "oklch(0.75 0.12 220)"
                  : undefined,
            }}
            data-ocid={`customer.request.item.${idx + 1}`}
          >
            <button
              type="button"
              onClick={() => handleExpand(req)}
              className="w-full p-4 text-left hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <ServiceTypeBadge serviceType={req.serviceType} />
                    <StatusBadge status={req.status} />
                    {req.hasNewReply && !req.isRead && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: "oklch(0.92 0.08 220 / 0.8)",
                          color: "oklch(0.35 0.15 220)",
                          border: "1px solid oklch(0.75 0.12 220)",
                        }}
                      >
                        <Bell className="w-3 h-3" />
                        New Reply!
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground font-medium truncate">
                    {req.problemDescription}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    #{req.requestId.toString()} · {formatDate(req.submittedAt)}
                  </p>
                </div>
                <div className="text-muted-foreground flex-shrink-0 mt-1">
                  {expandedId === req.requestId ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedId === req.requestId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Problem Description
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {req.problemDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Customer
                        </p>
                        <p className="text-sm font-medium">
                          {req.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{req.phone}</p>
                      </div>
                    </div>
                    {req.adminReply ? (
                      <div
                        className="rounded-lg p-3"
                        style={{
                          background: "oklch(0.92 0.06 220 / 0.3)",
                          border: "1px solid oklch(0.78 0.1 220)",
                        }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: "oklch(0.45 0.14 220)" }}
                        >
                          Admin Reply
                        </p>
                        <p className="text-sm text-foreground">
                          {req.adminReply}
                        </p>
                        {req.repliedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(req.repliedAt)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No reply yet. We'll respond to you soon.
                      </p>
                    )}
                    {req.status === Status.completed && (
                      <ReviewForm requestId={req.requestId} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
