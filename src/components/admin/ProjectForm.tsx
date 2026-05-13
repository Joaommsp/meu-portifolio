"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, Upload, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUploader } from "@/components/admin/ImageUploader"
import { GalleryUploader } from "@/components/admin/GalleryUploader"
import { MarkdownEditor } from "@/components/admin/MarkdownEditor"
import { TagsInput } from "@/components/admin/TagsInput"
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations"
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  type ProjectCategory,
  type ProjectStatus,
} from "@/types/project"
import type { ProjectInput } from "@/types/project"
import { slugify } from "@/lib/utils"
import {
  createProject,
  updateProject,
  isProjectSlugTaken,
} from "@/lib/firebase/projects"

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: "Web",
  mobile: "Mobile",
  api: "API",
  design: "Design",
  outro: "Outro",
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  "em-desenvolvimento": "Em desenvolvimento",
  concluido: "Concluído",
  arquivado: "Arquivado",
}

const AUTO_SAVE_INTERVAL_MS = 30_000
const AUTO_SAVE_KEY_PREFIX = "draft:project:"

const EMPTY: ProjectFormValues = {
  slug: "",
  title: "",
  shortDescription: "",
  fullDescription: "",
  coverImage: "",
  gallery: [],
  technologies: [],
  category: "web",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  status: "em-desenvolvimento",
  startDate: "",
  endDate: "",
}

type Props = {
  projectId?: string
  initialValues?: Partial<ProjectFormValues>
}

function toIsoDate(d: Date): string {
  // YYYY-MM-DD em fuso local (input type=date espera isso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function fromIsoDate(s: string): Date {
  // Sem timezone: cria no local time pra evitar shift de UTC
  return new Date(`${s}T00:00:00`)
}

export function ProjectForm({ projectId, initialValues }: Props) {
  const router = useRouter()
  const isEdit = Boolean(projectId)
  const draftKey = `${AUTO_SAVE_KEY_PREFIX}${projectId ?? "new"}`

  const [submitting, setSubmitting] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    Boolean(initialValues?.slug)
  )
  const [draftAvailable, setDraftAvailable] =
    React.useState<ProjectFormValues | null>(null)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { ...EMPTY, ...initialValues },
    mode: "onBlur",
  })

  const titleValue = form.watch("title")
  const allValues = form.watch()

  // Auto-slug
  React.useEffect(() => {
    if (slugManuallyEdited) return
    const next = slugify(titleValue ?? "")
    if (next && next !== form.getValues("slug")) {
      form.setValue("slug", next, { shouldValidate: false })
    }
  }, [titleValue, slugManuallyEdited, form])

  // Detecta rascunho salvo
  React.useEffect(() => {
    if (isEdit) return
    try {
      const raw = window.localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as ProjectFormValues
      if (draft.title || draft.fullDescription) {
        setDraftAvailable(draft)
      }
    } catch {
      /* ignore */
    }
  }, [isEdit, draftKey])

  // Auto-save 30s
  React.useEffect(() => {
    const id = window.setInterval(() => {
      const values = form.getValues()
      if (!values.title && !values.fullDescription) return
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(values))
        setLastSaved(new Date())
      } catch {
        /* ignore */
      }
    }, AUTO_SAVE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [form, draftKey])

  function restoreDraft() {
    if (!draftAvailable) return
    form.reset(draftAvailable)
    setSlugManuallyEdited(true)
    setDraftAvailable(null)
    toast.success("Rascunho restaurado")
  }

  function discardDraft() {
    try {
      window.localStorage.removeItem(draftKey)
    } catch {
      /* ignore */
    }
    setDraftAvailable(null)
  }

  /** Converte ProjectFormValues (strings) para ProjectInput (Date + null URLs). */
  function toProjectInput(values: ProjectFormValues): ProjectInput {
    return {
      slug: values.slug,
      title: values.title,
      shortDescription: values.shortDescription,
      fullDescription: values.fullDescription,
      coverImage: values.coverImage,
      gallery: values.gallery,
      technologies: values.technologies,
      category: values.category,
      liveUrl: values.liveUrl.trim() || null,
      githubUrl: values.githubUrl.trim() || null,
      featured: values.featured,
      status: values.status,
      startDate: fromIsoDate(values.startDate),
      endDate: values.endDate ? fromIsoDate(values.endDate) : null,
    }
  }

  async function onSubmit(
    values: ProjectFormValues,
    featuredOverride?: boolean
  ): Promise<void> {
    const finalValues = {
      ...values,
      featured:
        featuredOverride !== undefined ? featuredOverride : values.featured,
    }

    try {
      const taken = await isProjectSlugTaken(finalValues.slug, projectId)
      if (taken) {
        form.setError("slug", { message: "Slug já em uso por outro projeto" })
        return
      }
    } catch (err) {
      toast.error("Erro ao validar slug", {
        description: err instanceof Error ? err.message : undefined,
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = toProjectInput(finalValues)
      if (isEdit && projectId) {
        await updateProject(projectId, payload)
        toast.success("Projeto atualizado")
      } else {
        const newId = await createProject(payload)
        toast.success("Projeto criado")
        try {
          window.localStorage.removeItem(draftKey)
        } catch {
          /* ignore */
        }
        router.replace(`/admin/projetos/${newId}/editar`)
        return
      }
    } catch (err) {
      toast.error("Erro ao salvar", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const errors = form.formState.errors

  return (
    <form
      onSubmit={form.handleSubmit((v) => onSubmit(v))}
      className="space-y-8"
      noValidate
    >
      {draftAvailable && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="font-medium">📝 Rascunho não-salvo encontrado</p>
              <p className="text-xs text-muted-foreground">
                Você começou a escrever algo aqui antes mas não salvou.
                Restaurar?
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={restoreDraft}>
                <RotateCcw className="size-3.5" data-icon="inline-start" />
                Restaurar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={discardDraft}
              >
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Coluna principal */}
        <div className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Nome do projeto"
              className="h-11 text-lg"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                /projetos/
              </span>
              <Input
                id="slug"
                {...form.register("slug", {
                  onChange: () => setSlugManuallyEdited(true),
                })}
                placeholder="meu-projeto"
                className="font-mono text-sm"
                aria-invalid={!!errors.slug}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Descrição curta */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descrição curta</Label>
            <Textarea
              id="shortDescription"
              {...form.register("shortDescription")}
              placeholder="Aparece nos cards e meta SEO. 1-2 frases."
              rows={3}
              aria-invalid={!!errors.shortDescription}
            />
            <p className="text-xs text-muted-foreground">
              {(allValues.shortDescription ?? "").length}/200
            </p>
            {errors.shortDescription && (
              <p className="text-xs text-destructive">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          {/* Descrição completa (markdown) */}
          <Controller
            control={form.control}
            name="fullDescription"
            render={({ field }) => (
              <MarkdownEditor
                label="Descrição completa"
                value={field.value}
                onChange={field.onChange}
                error={errors.fullDescription?.message}
                rows={18}
              />
            )}
          />

          {/* Links externos */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="liveUrl">URL ao vivo (opcional)</Label>
              <Input
                id="liveUrl"
                type="url"
                placeholder="https://meu-projeto.com"
                {...form.register("liveUrl")}
                aria-invalid={!!errors.liveUrl}
              />
              {errors.liveUrl && (
                <p className="text-xs text-destructive">
                  {errors.liveUrl.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub (opcional)</Label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/..."
                {...form.register("githubUrl")}
                aria-invalid={!!errors.githubUrl}
              />
              {errors.githubUrl && (
                <p className="text-xs text-destructive">
                  {errors.githubUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Galeria */}
          <Controller
            control={form.control}
            name="gallery"
            render={({ field }) => (
              <GalleryUploader
                value={field.value}
                onChange={field.onChange}
                description="Imagens adicionais que aparecem na página de detalhe."
              />
            )}
          />
          {errors.gallery && (
            <p className="text-xs text-destructive">
              {errors.gallery.message}
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Status / Salvar */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium">Visibilidade</p>
              <Controller
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label htmlFor="featured" className="cursor-pointer">
                        Destaque
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Aparece na home + topo do /projetos
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <div className="space-y-2 border-t border-border pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" data-icon="inline-start" />
                  )}
                  {isEdit ? "Salvar alterações" : "Criar projeto"}
                </Button>
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={submitting}
                    onClick={form.handleSubmit((v) => onSubmit(v, true))}
                  >
                    <Upload className="size-4" data-icon="inline-start" />
                    Criar e destacar
                  </Button>
                )}
              </div>

              {lastSaved && (
                <p className="flex items-center justify-center gap-1 text-center text-[0.65rem] font-mono text-muted-foreground">
                  <Check className="size-3 text-success" />
                  Auto-save:{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(lastSaved)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status do projeto */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Status do projeto</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </CardContent>
          </Card>

          {/* Categoria */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Categoria</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABEL[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Período</Label>
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-xs text-muted-foreground"
                >
                  Início
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className="text-xs text-muted-foreground"
                >
                  Término (vazio se em andamento)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register("endDate")}
                  aria-invalid={!!errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cover */}
          <Card>
            <CardContent className="p-5">
              <Controller
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    folder="portfolio/projects"
                  />
                )}
              />
              {errors.coverImage && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.coverImage.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tecnologias */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Tecnologias</Label>
              <Controller
                control={form.control}
                name="technologies"
                render={({ field }) => (
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="React, Next.js…"
                    maxTags={20}
                    error={errors.technologies?.message}
                  />
                )}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  )
}

/** Helper exportado pra converter Project (do Firestore) em ProjectFormValues. */
export function projectToFormValues(p: {
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  coverImage: string
  gallery: string[]
  technologies: string[]
  category: ProjectCategory
  liveUrl: string | null
  githubUrl: string | null
  featured: boolean
  status: ProjectStatus
  startDate: Date
  endDate: Date | null
}): ProjectFormValues {
  return {
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    coverImage: p.coverImage,
    gallery: p.gallery,
    technologies: p.technologies,
    category: p.category,
    liveUrl: p.liveUrl ?? "",
    githubUrl: p.githubUrl ?? "",
    featured: p.featured,
    status: p.status,
    startDate: toIsoDate(p.startDate),
    endDate: p.endDate ? toIsoDate(p.endDate) : "",
  }
}
