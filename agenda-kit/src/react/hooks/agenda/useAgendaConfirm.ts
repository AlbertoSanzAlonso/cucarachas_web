import { useCallback, useState } from 'react'

export type ConfirmDialogState = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
}

export function useAgendaConfirm() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const [busy, setBusy] = useState(false)

  const close = useCallback(() => {
    if (busy) return
    setConfirmDialog(null)
  }, [busy])

  const confirm = useCallback(async () => {
    if (!confirmDialog || busy) return
    setBusy(true)
    try {
      await confirmDialog.onConfirm()
      setConfirmDialog(null)
    } finally {
      setBusy(false)
    }
  }, [confirmDialog, busy])

  return { confirmDialog, setConfirmDialog, busy, close, confirm }
}
