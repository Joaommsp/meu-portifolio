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
import { MarkdownEditor } from "@/components/admin/MarkdownEditor"
import { TagsInput } from "@/components/admin/TagsInput"
import { postFormSchema, type PostFormValues } from "@/lib/validations"
import { POST_CATEGORIES, type PostCategory } from "@/types/post"
import { slugify } from "@/lib/utils"
import { createPost, updatePost, isSlugTaken } from "@/lib/firebase/posts"

const CATEGORY_LABEL: Record<PostCategory, string> = {
  pensamento: "Pensamento",
  tutorial: "Tutorial",
  review: "Review",
  noticia: "Notícia",
  outro: "Outro",
}

const AUTO_SAVE_INTERVAL_MS = 30_000
const AUTO_SAVE_KEY_PREFIX = "draft:post:"

type Props = {
  /** Se passado, modo edição. */
  postId?: string
  initialValues?: Partial<PostFormValues>
}

const EMPTY: PostFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "pensamento",
  tags: [],
  published: false,
  featured: false,
}

export function PostForm({ postId, initialValues }: Props) {
  const router = useRouter()
  const isEdit = Boolean(postId)
  const draftKey = `${AUTO_SAVE_KEY_PREFIX}${postId ?? "new"}`

  const [submitting, setSubmitting] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    Boolean(initialValues?.slug)
  )
  const [draftAvailable, setDraftAvailable] = React.useState<PostFormValues | null>(
    null
  )

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { ...EMPTY, ...initialValues },
    mode: "onBlur",
  })

  const titleValue = form.watch("title")
  const allValues = form.watch()

  // Auto-slug a partir do título (se o user ainda não editou slug manualmente)
  React.useEffect(() => {
    if (slugManuallyEdited) return
    const next = slugify(titleValue ?? "")
    if (next && next !== form.getValues("slug")) {
      form.setValue("slug", next, { shouldValidate: false })
    }
  }, [titleValue, slugManuallyEdited, form])

  // Detecta rascunho salvo no localStorage (só no modo /novo, sem initialValues do server)
  React.useEffect(() => {
    if (isEdit) return
    try {
      const raw = window.localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as PostFormValues
      if (draft.title || draft.content) {
        setDraftAvailable(draft)
      }
    } catch {
      /* ignore */
    }
  }, [isEdit, draftKey])

  // Auto-save no localStorage a cada 30s
  React.useEffect(() => {
    const id = window.setInterval(() => {
      const values = form.getValues()
      if (!values.title && !values.content) return
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(values))
        setLastSaved(new Date())
      } catch {
        /* localStorage cheio ou desabilitado */
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

  async function onSubmit(
    values: PostFormValues,
    publishOverride?: boolean
  ): Promise<void> {
    const finalValues = {
      ...values,
      published:
        publishOverride !== undefined ? publishOverride : values.published,
    }

    // Verificação de slug único
    try {
      const taken = await isSlugTaken(finalValues.slug, postId)
      if (taken) {
        form.setError("slug", { message: "Slug já em uso por outro post" })
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
      if (isEdit && postId) {
        await updatePost(postId, finalValues)
        toast.success("Post atualizado")
      } else {
        const newId = await createPost(finalValues)
        toast.success(finalValues.published ? "Post publicado" : "Rascunho salvo")
        // Limpa rascunho local
        try {
          window.localStorage.removeItem(draftKey)
        } catch {
          /* ignore */
        }
        router.replace(`/admin/posts/${newId}/editar`)
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
      {/* Banner de rascunho disponível */}
      {draftAvailable && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="font-medium">📝 Rascunho não-salvo encontrado</p>
              <p className="text-xs text-muted-foreground">
                Você começou a escrever algo aqui antes mas não salvou. Restaurar?
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

      {/* Layout 2 colunas: form principal + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Título do post"
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
                /blog/
              </span>
              <Input
                id="slug"
                {...form.register("slug", {
                  onChange: () => setSlugManuallyEdited(true),
                })}
                placeholder="meu-post-incrivel"
                className="font-mono text-sm"
                aria-invalid={!!errors.slug}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (resumo)</Label>
            <Textarea
              id="excerpt"
              {...form.register("excerpt")}
              placeholder="Um parágrafo curto que aparece nos cards e no SEO."
              rows={3}
              aria-invalid={!!errors.excerpt}
            />
            <p className="text-xs text-muted-foreground">
              {(allValues.excerpt ?? "").length}/300 caracteres
            </p>
            {errors.excerpt && (
              <p className="text-xs text-destructive">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          {/* Conteúdo */}
          <Controller
            control={form.control}
            name="content"
            render={({ field }) => (
              <MarkdownEditor
                label="Conteúdo"
                value={field.value}
                onChange={field.onChange}
                error={errors.content?.message}
                rows={20}
              />
            )}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Status / Publicação */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium">Status</p>
              <Controller
                control={form.control}
                name="published"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label htmlFor="published" className="cursor-pointer">
                        Publicado
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Visível em /blog
                      </p>
                    </div>
                    <Switch
                      id="published"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
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
                        Aparece no card grande
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
                  type="button"
                  className="w-full"
                  disabled={submitting}
                  onClick={form.handleSubmit((v) => onSubmit(v, true))}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" data-icon="inline-start" />
                  )}
                  Publicar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={submitting}
                  onClick={form.handleSubmit((v) => onSubmit(v, false))}
                >
                  <Save className="size-4" data-icon="inline-start" />
                  Salvar rascunho
                </Button>
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
                      {POST_CATEGORIES.map((cat) => (
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

          {/* Imagem de capa */}
          <Card>
            <CardContent className="p-5">
              <Controller
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    folder="portfolio/posts"
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

          {/* Tags */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Tags</Label>
              <Controller
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.tags?.message}
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
