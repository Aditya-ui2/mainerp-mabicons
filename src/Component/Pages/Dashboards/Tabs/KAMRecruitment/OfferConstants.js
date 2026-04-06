import {
  FileText, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  FilePlus
} from "lucide-react";

export const OFFER_STATUS_COLORS = {
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Sent: "bg-blue-100 text-blue-700 border-blue-200",
  Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Declined: "bg-red-100 text-red-700 border-red-200",
  Expired: "bg-amber-100 text-amber-700 border-amber-200",
  Negotiating: "bg-purple-100 text-purple-700 border-purple-200",
  "Pending Approval": "bg-amber-100 text-amber-700 border-amber-200",
  Generated: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export const STATUS_ICONS = {
  Draft: FileText,
  Sent: Send,
  Accepted: CheckCircle2,
  Declined: XCircle,
  Expired: AlertCircle,
  Negotiating: RotateCcw,
  "Pending Approval": AlertCircle,
  Generated: FilePlus,
};

export const AVATAR_COLORS = {
  // ... (keeping avatar colors)
  Z: "bg-green-100 text-green-700",
};

export const statusOrder = ["Draft", "Generated", "Pending Approval", "Sent", "Negotiating", "Accepted", "Declined", "Expired"];
