"use client"

import { Loader2, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type Confirmacao = {
  titulo: string
  descricao: string
  rotulo: string
  icone?: LucideIcon
}

type Props = {
  confirmacao: Confirmacao | null
  enviando: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

/** Confirmação de revogar, encerrar ou apagar, antes de enviar. */
export function ConfirmarAcao({ confirmacao, enviando, onConfirmar, onCancelar }: Props) {
  const Icone = confirmacao?.icone
  return (
    <Dialog
      open={confirmacao !== null}
      onOpenChange={(aberto) => !aberto && !enviando && onCancelar()}
    >
      <DialogContent showCloseButton={false} role="alertdialog">
        {confirmacao && (
          <>
            <DialogHeader>
              <DialogTitle>{confirmacao.titulo}</DialogTitle>
              <DialogDescription>{confirmacao.descricao}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancelar}
                disabled={enviando}
                className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirmar}
                disabled={enviando}
                className="cursor-pointer disabled:pointer-events-auto disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <Loader2 className="animate-spin" aria-hidden />
                ) : (
                  Icone && <Icone aria-hidden />
                )}
                {confirmacao.rotulo}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
