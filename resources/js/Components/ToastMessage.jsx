// resources/js/Components/ToastMessage.jsx
import { toast } from "sonner";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const toastConfig = {
    success: {
        icon: CheckCircle,
        border: "border-emerald-400",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/80",
        title: "text-emerald-800",
        message: "text-emerald-700",
        close: "hover:bg-emerald-200/60 text-emerald-400 hover:text-emerald-700",
        shadow: "shadow-emerald-200/50",
        ring: "ring-emerald-400/20",
        selection: "selection:bg-emerald-200",
    },
    error: {
        icon: AlertCircle,
        border: "border-rose-400",
        bg: "bg-gradient-to-br from-rose-50 to-rose-100/80",
        title: "text-rose-800",
        message: "text-rose-700",
        close: "hover:bg-rose-200/60 text-rose-400 hover:text-rose-700",
        shadow: "shadow-rose-200/50",
        ring: "ring-rose-400/20",
        selection: "selection:bg-rose-200",
    },
    warning: {
        icon: AlertTriangle,
        border: "border-amber-400",
        bg: "bg-gradient-to-br from-amber-50 to-amber-100/80",
        title: "text-amber-800",
        message: "text-amber-700",
        close: "hover:bg-amber-200/60 text-amber-400 hover:text-amber-700",
        shadow: "shadow-amber-200/50",
        ring: "ring-amber-400/20",
        selection: "selection:bg-amber-200",
    },
    info: {
        icon: Info,
        border: "border-sky-400",
        bg: "bg-gradient-to-br from-sky-50 to-sky-100/80",
        title: "text-sky-800",
        message: "text-sky-700",
        close: "hover:bg-sky-200/60 text-sky-400 hover:text-sky-700",
        shadow: "shadow-sky-200/50",
        ring: "ring-sky-400/20",
        selection: "selection:bg-sky-200",
    },
};

const titles = {
    success: "¡Perfecto!",
    error: "¡Oops!",
    warning: "¡Atención!",
    info: "Información",
};

export const showToast = (type, message, title = null) => {
    const config = toastConfig[type] || toastConfig.info;
    const Icon = config.icon;
    const displayTitle = title || titles[type] || "Notificación";

    // Función para copiar al portapapeles
    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        toast.info("Texto copiado al portapapeles", {
            duration: 1000,
            position: "bottom-center",
        });
    };

    toast.custom(
        (t) => (
            <div
                className={`
          ${config.bg} ${config.border} ${config.shadow} ${config.ring} ${config.selection}
          border-l-4 rounded-2xl shadow-2xl p-4 
          max-w-sm w-full relative group
          backdrop-blur-sm backdrop-filter
          ring-1 ring-offset-1
          transition-all duration-300
          hover:scale-[1.02] hover:shadow-3xl
          select-text
        `}
                role="alert"
            >
                {/* Close Button */}
                <button
                    onClick={() => toast.dismiss(t)}
                    className={`
            absolute top-2 right-2 
            p-1.5 rounded-xl 
            transition-all duration-300 
            ${config.close}
            opacity-0 group-hover:opacity-100
            focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2
            select-none
          `}
                    aria-label="Cerrar notificación"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>

                {/* Content */}
                <div className="flex items-start gap-3 pr-6">
                    <div className="flex-shrink-0 mt-0.5 select-none">
                        <div
                            className={`
              p-1.5 rounded-xl 
              bg-white/50 backdrop-blur-sm
              shadow-inner
            `}
                        >
                            <Icon
                                size={22}
                                className={`${config.title} stroke-[2.5]`}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            className={`font-bold text-sm uppercase tracking-wider ${config.title} select-text`}
                        >
                            {displayTitle}
                        </h3>
                        <p
                            className={`text-sm font-medium mt-1 leading-relaxed ${config.message} select-text cursor-text`}
                            onDoubleClick={handleCopy}
                            title="Doble clic para copiar mensaje"
                        >
                            {message}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl select-none">
                    <div
                        className={`
              h-full bg-gradient-to-r from-transparent via-${config.border.split("-")[1]}-400 to-transparent
            `}
                        style={{
                            width: "100%",
                            animation: "progress 5s ease-in-out forwards",
                        }}
                    />
                </div>
            </div>
        ),
        {
            duration: 5000,
            position: "top-right",
            className: "!p-0 !bg-transparent !shadow-none",
            closeButton: false,
        },
    );
};

// Helper functions
export const toastSuccess = (message, title = "¡Perfecto!") =>
    showToast("success", message, title);
export const toastError = (message, title = "¡Oops!") =>
    showToast("error", message, title);
export const toastWarning = (message, title = "¡Atención!") =>
    showToast("warning", message, title);
export const toastInfo = (message, title = "Información") =>
    showToast("info", message, title);

// Default export
export default {
    showToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
};
