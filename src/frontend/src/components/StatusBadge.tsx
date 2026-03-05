import { ServiceType, Status } from "../backend.d";

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; className: string }> = {
    [Status.pending]: { label: "Pending", className: "badge-pending" },
    [Status.inProgress]: {
      label: "In Progress",
      className: "badge-inprogress",
    },
    [Status.completed]: { label: "Completed", className: "badge-completed" },
  };
  const { label, className } = map[status] ?? { label: status, className: "" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export function ServiceTypeBadge({
  serviceType,
}: { serviceType: ServiceType }) {
  const map: Record<ServiceType, { label: string; className: string }> = {
    [ServiceType.cctv]: { label: "CCTV", className: "badge-cctv" },
    [ServiceType.computer]: { label: "Computer", className: "badge-computer" },
  };
  const { label, className } = map[serviceType] ?? {
    label: serviceType,
    className: "",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
