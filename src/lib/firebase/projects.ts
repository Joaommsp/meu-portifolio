import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore"

import { requireDb } from "./config"
import type { Project, ProjectDoc, ProjectInput } from "@/types/project"

const PROJECTS_COLLECTION = "projects"

function toProject(id: string, data: Omit<ProjectDoc, "id">): Project {
  return {
    ...data,
    id,
    startDate: data.startDate.toDate(),
    endDate: data.endDate?.toDate() ?? null,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

type ListProjectsOptions = {
  featuredOnly?: boolean
  category?: string
  technology?: string
  status?: string
  limit?: number
}

export async function listProjects(
  options: ListProjectsOptions = {}
): Promise<Project[]> {
  const db = requireDb()
  const constraints: QueryConstraint[] = []
  if (options.featuredOnly) {
    constraints.push(where("featured", "==", true))
  }
  if (options.category) {
    constraints.push(where("category", "==", options.category))
  }
  if (options.technology) {
    constraints.push(
      where("technologies", "array-contains", options.technology)
    )
  }
  if (options.status) {
    constraints.push(where("status", "==", options.status))
  }
  constraints.push(orderBy("startDate", "desc"))
  if (options.limit) {
    constraints.push(fbLimit(options.limit))
  }

  const q = query(collection(db, PROJECTS_COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) =>
    toProject(d.id, d.data() as Omit<ProjectDoc, "id">)
  )
}

export async function getProject(id: string): Promise<Project | null> {
  const db = requireDb()
  const ref = doc(db, PROJECTS_COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toProject(snap.id, snap.data() as Omit<ProjectDoc, "id">)
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  const db = requireDb()
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("slug", "==", slug),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  if (!first) return null
  return toProject(first.id, first.data() as Omit<ProjectDoc, "id">)
}

export async function createProject(input: ProjectInput): Promise<string> {
  const db = requireDb()
  const now = serverTimestamp()
  const payload = {
    ...input,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: input.endDate ? Timestamp.fromDate(input.endDate) : null,
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, PROJECTS_COLLECTION), payload)
  return ref.id
}

export async function updateProject(
  id: string,
  patch: Partial<ProjectInput>
): Promise<void> {
  const db = requireDb()
  const updates: Record<string, unknown> = {
    ...patch,
    updatedAt: serverTimestamp(),
  }
  if (patch.startDate !== undefined) {
    updates.startDate = Timestamp.fromDate(patch.startDate)
  }
  if (patch.endDate !== undefined) {
    updates.endDate = patch.endDate ? Timestamp.fromDate(patch.endDate) : null
  }
  await updateDoc(doc(db, PROJECTS_COLLECTION, id), updates)
}

export async function deleteProject(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, PROJECTS_COLLECTION, id))
}

export async function isProjectSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const db = requireDb()
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("slug", "==", slug),
    fbLimit(1)
  )
  const snap = await getDocs(q)
  const first = snap.docs[0]
  if (!first) return false
  return first.id !== excludeId
}
