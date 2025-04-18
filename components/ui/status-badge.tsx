import { Check, X, AlertTriangle, Clock } from "lucide-react"

interface StatusBadgeProps {
  status: "valid" | "invalid" | "pending" | "rejected" | "expired" | "needs-revalidation"
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "valid":
        return {
          icon: <Check className="h-3 w-3" />,
          color: "bg-green-500",
          text: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          label: label || "Valid",
        }
      case "invalid":
      case "rejected":
        return {
          icon: <X className="h-3 w-3" />,
          color: "bg-red-500",
          text: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          label: label || (status === "invalid" ? "Invalid" : "Rejected"),
        }
      case "pending":
        return {
          icon: <Clock className="h-3 w-3" />,
          color: "bg-yellow-500",
          text: "text-yellow-700",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          label: label || "Pending",
        }
      case "expired":
      case "needs-revalidation":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          color: "bg-amber-500",
          text: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          label: label || (status === "expired" ? "Expired" : "Needs Revalidation"),
        }
      default:
        return {
          icon: null,
          color: "bg-gray-500",
          text: "text-gray-700",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: label || status,
        }
    }
  }

  const { icon, color, text, bg, border, label: displayLabel } = getStatusConfig()

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} ${border} ${className}`}
    >
      <div className={`mr-1.5 h-2 w-2 rounded-full ${color}`} />
      {icon && <span className="mr-1">{icon}</span>}
      {displayLabel}
    </div>
  )
}
