import { create } from 'zustand'

const STORAGE_KEY = 'kanban-task-extras-v1'

const emptyProjectState = () => ({
  customFields: [],
  taskMeta: {}
})

const loadState = () => {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const persistState = (projects) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

const ensureProject = (projects, projectId) => {
  const nextProjects = { ...projects }
  if (!nextProjects[projectId]) {
    nextProjects[projectId] = emptyProjectState()
  }
  return nextProjects
}

const ensureTaskMeta = (projects, projectId, taskId) => {
  const nextProjects = ensureProject(projects, projectId)
  const project = nextProjects[projectId]
  if (!project.taskMeta[taskId]) {
    project.taskMeta = {
      ...project.taskMeta,
      [taskId]: {
        attachments: [],
        customFieldValues: {},
        recurrence: { enabled: false, frequency: 'weekly', interval: 1 },
        completedAt: null
      }
    }
  }
  return nextProjects
}

const updateProjects = (set, updater) => {
  set((state) => {
    const nextProjects = updater(state.projects || {})
    persistState(nextProjects)
    return { projects: nextProjects }
  })
}

export const useTaskExtrasStore = create((set, get) => ({
  projects: loadState(),

  getProjectCustomFields: (projectId) => get().projects[projectId]?.customFields || [],

  getTaskMeta: (projectId, taskId) => {
    const project = get().projects[projectId]
    return project?.taskMeta?.[taskId] || {
      attachments: [],
      customFieldValues: {},
      recurrence: { enabled: false, frequency: 'weekly', interval: 1 },
      completedAt: null
    }
  },

  upsertCustomField: (projectId, field) => updateProjects(set, (projects) => {
    const nextProjects = ensureProject(projects, projectId)
    const project = nextProjects[projectId]
    const existingIndex = project.customFields.findIndex((item) => item.id === field.id)
    const nextField = { ...field }
    if (existingIndex >= 0) {
      project.customFields = project.customFields.map((item) => item.id === field.id ? nextField : item)
    } else {
      project.customFields = [...project.customFields, nextField]
    }
    return nextProjects
  }),

  removeCustomField: (projectId, fieldId) => updateProjects(set, (projects) => {
    const nextProjects = ensureProject(projects, projectId)
    const project = nextProjects[projectId]
    project.customFields = project.customFields.filter((field) => field.id !== fieldId)
    Object.keys(project.taskMeta).forEach((taskId) => {
      const meta = project.taskMeta[taskId]
      if (meta?.customFieldValues?.[fieldId] !== undefined) {
        const nextValues = { ...meta.customFieldValues }
        delete nextValues[fieldId]
        project.taskMeta[taskId] = { ...meta, customFieldValues: nextValues }
      }
    })
    return nextProjects
  }),

  updateCustomFieldValue: (projectId, taskId, fieldId, value) => updateProjects(set, (projects) => {
    const nextProjects = ensureTaskMeta(projects, projectId, taskId)
    const project = nextProjects[projectId]
    const meta = project.taskMeta[taskId]
    project.taskMeta[taskId] = {
      ...meta,
      customFieldValues: {
        ...meta.customFieldValues,
        [fieldId]: value
      }
    }
    return nextProjects
  }),

  addAttachment: (projectId, taskId, attachment) => updateProjects(set, (projects) => {
    const nextProjects = ensureTaskMeta(projects, projectId, taskId)
    const project = nextProjects[projectId]
    const meta = project.taskMeta[taskId]
    project.taskMeta[taskId] = {
      ...meta,
      attachments: [...(meta.attachments || []), attachment]
    }
    return nextProjects
  }),

  removeAttachment: (projectId, taskId, attachmentId) => updateProjects(set, (projects) => {
    const nextProjects = ensureTaskMeta(projects, projectId, taskId)
    const project = nextProjects[projectId]
    const meta = project.taskMeta[taskId]
    project.taskMeta[taskId] = {
      ...meta,
      attachments: (meta.attachments || []).filter((attachment) => attachment.id !== attachmentId)
    }
    return nextProjects
  }),

  updateRecurrence: (projectId, taskId, recurrence) => updateProjects(set, (projects) => {
    const nextProjects = ensureTaskMeta(projects, projectId, taskId)
    const project = nextProjects[projectId]
    const meta = project.taskMeta[taskId]
    project.taskMeta[taskId] = {
      ...meta,
      recurrence: {
        enabled: Boolean(recurrence.enabled),
        frequency: recurrence.frequency || 'weekly',
        interval: Number(recurrence.interval) > 0 ? Number(recurrence.interval) : 1
      }
    }
    return nextProjects
  }),

  setCompletedAt: (projectId, taskId, completedAt) => updateProjects(set, (projects) => {
    const nextProjects = ensureTaskMeta(projects, projectId, taskId)
    const project = nextProjects[projectId]
    const meta = project.taskMeta[taskId]
    project.taskMeta[taskId] = {
      ...meta,
      completedAt
    }
    return nextProjects
  }),

  removeTask: (projectId, taskId) => updateProjects(set, (projects) => {
    const nextProjects = ensureProject(projects, projectId)
    const project = nextProjects[projectId]
    if (project.taskMeta?.[taskId]) {
      const nextTaskMeta = { ...project.taskMeta }
      delete nextTaskMeta[taskId]
      project.taskMeta = nextTaskMeta
    }
    return nextProjects
  })
}))
