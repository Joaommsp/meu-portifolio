"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, Upload, Check } from "lucide-react"
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
import { gameFormSchema, type GameFormValues } from "@/lib/validations"
import { GAME_STATUSES, type GameStatus } from "@/types/game"
import { slugify } from "@/lib/utils"
import { createGame, updateGame, isSlugTaken } from "@/lib/firebase/games"

const STATUS_LABEL: Record<GameStatus, string> = {
  jogando: "Jogando",
  concluido: "Concluído",
  rejogando: "Rejogando",
  wishlist: "Wishlist",
  abandonado: "Abandonado",
}

type Props = {
  gameId?: string
  initialValues?: Partial<GameFormValues>
}

const EMPTY: GameFormValues = {
  slug: "",
  title: "",
  shortDescription: "",
  history: "",
  whyILikeIt: "",
  coverImage: "",
  gallery: [],
  platforms: [],
  genres: [],
  status: "concluido",
  yearPlayed: new Date().getFullYear(),
  hoursPlayed: null,
  rating: null,
  featured: false,
  published: false,
}

export function GameForm({ gameId, initialValues }: Props) {
  const router = useRouter()
  const isEdit = Boolean(gameId)

  const [submitting, setSubmitting] = React.useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    Boolean(initialValues?.slug)
  )

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: { ...EMPTY, ...initialValues },
    mode: "onBlur",
  })

  const titleValue = form.watch("title")

  // Auto-slug a partir do título
  React.useEffect(() => {
    if (slugManuallyEdited) return
    const next = slugify(titleValue ?? "")
    if (next && next !== form.getValues("slug")) {
      form.setValue("slug", next, { shouldValidate: false })
    }
  }, [titleValue, slugManuallyEdited, form])

  async function onSubmit(
    values: GameFormValues,
    publishOverride?: boolean
  ): Promise<void> {
    const finalValues = {
      ...values,
      published:
        publishOverride !== undefined ? publishOverride : values.published,
    }

    try {
      const taken = await isSlugTaken(finalValues.slug, gameId)
      if (taken) {
        form.setError("slug", { message: "Slug já em uso por outro jogo" })
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
      if (isEdit && gameId) {
        await updateGame(gameId, finalValues)
        toast.success("Jogo atualizado")
      } else {
        const newId = await createGame(finalValues)
        toast.success(
          finalValues.published ? "Jogo publicado" : "Rascunho salvo"
        )
        router.replace(`/admin/games/${newId}/editar`)
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
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do jogo</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Ex: Hollow Knight"
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
                /games/
              </span>
              <Input
                id="slug"
                {...form.register("slug", {
                  onChange: () => setSlugManuallyEdited(true),
                })}
                placeholder="hollow-knight"
                className="font-mono text-sm"
                aria-invalid={!!errors.slug}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Short description */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descrição curta (one-liner)</Label>
            <Textarea
              id="shortDescription"
              {...form.register("shortDescription")}
              placeholder="Uma frase que aparece nos cards. Ex: Metroidvania melancólico que respeita o jogador."
              rows={2}
              aria-invalid={!!errors.shortDescription}
            />
            {errors.shortDescription && (
              <p className="text-xs text-destructive">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          {/* História do jogo */}
          <Controller
            control={form.control}
            name="history"
            render={({ field }) => (
              <MarkdownEditor
                label="História / Lore do jogo"
                value={field.value}
                onChange={field.onChange}
                error={errors.history?.message}
                rows={10}
              />
            )}
          />

          {/* Por que gosto */}
          <Controller
            control={form.control}
            name="whyILikeIt"
            render={({ field }) => (
              <MarkdownEditor
                label="Por que eu gosto deste jogo"
                value={field.value}
                onChange={field.onChange}
                error={errors.whyILikeIt?.message}
                rows={10}
              />
            )}
          />

          {/* Galeria */}
          <Card>
            <CardContent className="p-5">
              <Label className="mb-3 block">Galeria (screenshots)</Label>
              <Controller
                control={form.control}
                name="gallery"
                render={({ field }) => (
                  <GalleryUploader
                    value={field.value}
                    onChange={field.onChange}
                    folder="portfolio/games"
                  />
                )}
              />
              {errors.gallery && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.gallery.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Status / Publicação */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-medium">Visibilidade</p>
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
                        Visível em /games
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
                        Card grande no topo
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
            </CardContent>
          </Card>

          {/* Status do jogo */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GAME_STATUSES.map((s) => (
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

          {/* Cover */}
          <Card>
            <CardContent className="p-5">
              <Label className="mb-3 block">Capa do jogo</Label>
              <Controller
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <ImageUploader
                    value={field.value}
                    onChange={field.onChange}
                    folder="portfolio/games"
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

          {/* Plataformas */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Plataformas</Label>
              <Controller
                control={form.control}
                name="platforms"
                render={({ field }) => (
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.platforms?.message}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Ex: PC, PS5, Nintendo Switch
              </p>
            </CardContent>
          </Card>

          {/* Gêneros */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <Label>Gêneros</Label>
              <Controller
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.genres?.message}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Ex: RPG, Metroidvania, Indie
              </p>
            </CardContent>
          </Card>

          {/* Meta numérica */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-2">
                <Label htmlFor="yearPlayed">Ano que joguei</Label>
                <Input
                  id="yearPlayed"
                  type="number"
                  {...form.register("yearPlayed", { valueAsNumber: true })}
                  min={1970}
                  max={new Date().getFullYear() + 1}
                  aria-invalid={!!errors.yearPlayed}
                />
                {errors.yearPlayed && (
                  <p className="text-xs text-destructive">
                    {errors.yearPlayed.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPlayed">Horas jogadas (opcional)</Label>
                <Controller
                  control={form.control}
                  name="hoursPlayed"
                  render={({ field }) => (
                    <Input
                      id="hoursPlayed"
                      type="number"
                      placeholder="Ex: 80"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : Number(e.target.value)
                        )
                      }
                      min={0}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Nota pessoal 0-10 (opcional)</Label>
                <Controller
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <Input
                      id="rating"
                      type="number"
                      placeholder="Ex: 9.5"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : Number(e.target.value)
                        )
                      }
                      step="0.1"
                      min={0}
                      max={10}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  )
}
