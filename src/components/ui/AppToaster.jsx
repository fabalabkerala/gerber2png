import PropTypes from "prop-types";
import { Toaster, ToastBar, resolveValue, toast } from "react-hot-toast";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useApp } from "../context/AppContext";
import { cn } from "../../utils/cn";

const toneStyles = {
  success: {
    light: {
      shell: "border-emerald-200 bg-white text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.12)]",
      iconWrap: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      badge: "bg-emerald-50 text-emerald-700",
      close: "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
    },
    dark: {
      shell: "border-emerald-500/30 bg-slate-900 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
      iconWrap: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-300",
      close: "text-slate-500 hover:bg-slate-800 hover:text-slate-200",
    },
    label: "Success",
    Icon: CheckCircleIcon,
  },
  error: {
    light: {
      shell: "border-red-200 bg-white text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.12)]",
      iconWrap: "bg-red-50 text-red-600 border border-red-100",
      badge: "bg-red-50 text-red-700",
      close: "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
    },
    dark: {
      shell: "border-red-500/30 bg-slate-900 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
      iconWrap: "bg-red-500/15 text-red-300 border border-red-500/20",
      badge: "bg-red-500/10 text-red-300",
      close: "text-slate-500 hover:bg-slate-800 hover:text-slate-200",
    },
    label: "Error",
    Icon: ExclamationCircleIcon,
  },
  loading: {
    light: {
      shell: "border-cyan-200 bg-white text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.12)]",
      iconWrap: "bg-cyan-50 text-cyan-600 border border-cyan-100",
      badge: "bg-cyan-50 text-cyan-700",
      close: "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
    },
    dark: {
      shell: "border-cyan-500/30 bg-slate-900 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
      iconWrap: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20",
      badge: "bg-cyan-500/10 text-cyan-300",
      close: "text-slate-500 hover:bg-slate-800 hover:text-slate-200",
    },
    label: "Loading",
    Icon: ArrowPathIcon,
  },
  blank: {
    light: {
      shell: "border-slate-200 bg-white text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.12)]",
      iconWrap: "bg-slate-50 text-slate-500 border border-slate-100",
      badge: "bg-slate-50 text-slate-600",
      close: "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
    },
    dark: {
      shell: "border-slate-700 bg-slate-900 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
      iconWrap: "bg-slate-800 text-slate-300 border border-slate-700",
      badge: "bg-slate-800 text-slate-300",
      close: "text-slate-500 hover:bg-slate-800 hover:text-slate-200",
    },
    label: "Notice",
    Icon: CheckCircleIcon,
  },
};

const AppToaster = ({ top = 100 }) => {
  const { theme } = useApp();
  const mode = theme === "dark" ? "dark" : "light";

  return (
    <Toaster position="top-right" gutter={12} containerStyle={{ top }}>
      {(t) => {
        const tone = toneStyles[t.type] || toneStyles.blank;
        const palette = tone[mode];
        const Icon = tone.Icon;
        const isLoading = t.type === "loading";

        return (
          <ToastBar
            toast={t}
            style={{
              ...t.style,
              background: "transparent",
              boxShadow: "none",
              padding: 0,
              maxWidth: "none",
            }}
          >
            {() => (
              <div
                className={cn(
                  "flex min-w-[320px] max-w-[420px] items-start gap-3 rounded-2xl border px-3 py-3 backdrop-blur-sm transition-all",
                  palette.shell
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                    palette.iconWrap
                  )}
                >
                  <Icon className={cn("h-5 w-5", isLoading && "animate-spin")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                        palette.badge
                      )}
                    >
                      {tone.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-5">
                    {resolveValue(t.message, t)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => toast.dismiss(t.id)}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                    palette.close
                  )}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
};

AppToaster.propTypes = {
  top: PropTypes.number,
};

export default AppToaster;
