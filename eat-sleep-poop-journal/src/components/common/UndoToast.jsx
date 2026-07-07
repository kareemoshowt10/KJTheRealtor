import { useEffect } from 'react'

export default function UndoToast({ message, onUndo, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-gray-900 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg z-50 animate-slide-up">
      <span className="text-sm">{message}</span>
      <button onClick={onUndo} className="text-sm font-bold text-violet-300 ml-4 shrink-0">
        UNDO
      </button>
    </div>
  )
}
