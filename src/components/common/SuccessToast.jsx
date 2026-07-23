import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessToast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2200)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-gray-900 text-white rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-lg z-50 animate-slide-up pointer-events-none">
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
