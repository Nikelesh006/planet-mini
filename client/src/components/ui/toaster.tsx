import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check, AlertTriangle, X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, hideIcon, icon, ...props }) {
        const getIcon = () => {
          if (icon) {
            return icon
          }
          switch (variant) {
            case 'success':
              return (
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              )
            case 'destructive':
              return (
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                </div>
              )
            default:
              return (
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F6EE] border border-[#D0DEC0] text-[#556B2F] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              )
          }
        }

        return (
          <Toast key={id} duration={5000} {...props} variant={variant}>
            <div className="flex items-center gap-3">
              {!hideIcon && getIcon()}
              <div className="grid gap-0.5 flex-1 pr-4">
                {title && <ToastTitle className="font-bold text-sm text-gray-900 leading-tight">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs text-gray-600 leading-normal">{description}</ToastDescription>
                )}
              </div>
              {action}
            </div>
            <ToastClose className="absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 opacity-70 transition-all hover:opacity-100 hover:bg-gray-100 hover:text-gray-700 focus:opacity-100 focus:outline-none">
              <X className="h-4 w-4" />
            </ToastClose>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
