"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations"
import { CONTACT_EMAIL } from "@/lib/nav"

type State = "idle" | "submitting" | "success"

export function ContactForm() {
  const [state, setState] = React.useState<State>("idle")

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
  })

  function onSubmit(values: ContactFormValues) {
    setState("submitting")
    const subject = `Contato via portfolio — ${values.name}`
    const body = `${values.message}\n\n— ${values.name}\n${values.email}`
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`

    // Pequeno delay pra animação registrar
    window.setTimeout(() => {
      window.location.href = mailto
      setState("success")
      toast.success("Email aberto", {
        description:
          "Se nada abriu, copie o endereço dos cards ao lado e me chame direto.",
      })
    }, 400)
  }

  if (state === "success") {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <h3 className="font-display text-2xl font-bold">Tudo certo!</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Seu cliente de email deve ter aberto. Caso contrário, é só me
          chamar direto em{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-brand hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <Button
          variant="outline"
          onClick={() => {
            form.reset()
            setState("idle")
          }}
        >
          Mandar outra
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-border bg-card p-6 md:p-8"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Como você se chama?"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Sobre o que você quer conversar?"
                  rows={6}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={state === "submitting"}
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Abrindo cliente de email…
            </>
          ) : (
            <>
              <Send className="size-4" data-icon="inline-start" />
              Enviar mensagem
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          O envio abre seu cliente de email padrão com o conteúdo
          preenchido — você só revisa e clica enviar.
        </p>
      </form>
    </Form>
  )
}
