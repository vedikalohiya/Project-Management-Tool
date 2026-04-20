import { useState, useEffect, useMemo } from 'react'
import { useTaskStore } from './useTaskStore'
import { useBoardStore } from '../board/useBoardStore'
import { useBoardHistoryStore } from '../board/useBoardHistoryStore'
import { useProjectMembersStore } from '../projects/useProjectMembersStore'
import { useTaskExtrasStore } from './useTaskExtrasStore'

const LABELS = ['Feature', 'Bug', 'Design', 'Research', 'Urgent', 'Review']
const RECURRENCE_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

const defaultRecurrence = {
  enabled: false,
  frequency: 'weekly',
  interval: 1
}

const advanceDate = (dateValue, frequency, interval) => {
  const nextDate = new Date(dateValue || Date.now())
  if (frequency === 'daily') nextDate.setDate(nextDate.getDate() + interval)
  if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + (7 * interval))
  if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + interval)
  return nextDate.toISOString().slice(0, 10)
}

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Failed to read file'))
  reader.readAsDataURL(file)
})

export default function TaskDetail() {
  const { selectedTask, isOpen, closeTask, updateTask } = useTaskStore()
  const { deleteTask, addTask } = useBoardStore()
  const members = useProjectMembersStore((state) => state.members)
  const fetchMembers = useProjectMembersStore((state) => state.fetchMembers)
  const getTaskMeta = useTaskExtrasStore((state) => state.getTaskMeta)
  const upsertCustomField = useTaskExtrasStore((state) => state.upsertCustomField)
  const removeCustomField = useTaskExtrasStore((state) => state.removeCustomField)
  const updateCustomFieldValue = useTaskExtrasStore((state) => state.updateCustomFieldValue)
  const addAttachment = useTaskExtrasStore((state) => state.addAttachment)
  const removeAttachment = useTaskExtrasStore((state) => state.removeAttachment)
  const updateRecurrence = useTaskExtrasStore((state) => state.updateRecurrence)
  const setCompletedAt = useTaskExtrasStore((state) => state.setCompletedAt)
  const projects = useTaskExtrasStore((state) => state.projects)
  const projectCustomFields = useMemo(
    () => (selectedTask?.project_id ? (projects[selectedTask.project_id]?.customFields || []) : []),
    [projects, selectedTask?.project_id]
  )
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [label, setLabel] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [completed, setCompleted] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [customFieldValues, setCustomFieldValues] = useState({})
  const [recurrence, setRecurrence] = useState(defaultRecurrence)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')
  const [newFieldOptions, setNewFieldOptions] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (selectedTask) {
      const taskMeta = selectedTask.project_id ? getTaskMeta(selectedTask.project_id, selectedTask.id) : null
      setTitle(selectedTask.title || '')
      setDescription(selectedTask.description || '')
      setPriority(selectedTask.priority || 'medium')
      setDueDate(selectedTask.due_date || '')
      setLabel(selectedTask.label || '')
      setAssigneeId(selectedTask.assignee_id || '')
      setCompleted(Boolean(selectedTask.completed))
      setComments(selectedTask.comments || [])
      setAttachments(taskMeta?.attachments || [])
      setCustomFieldValues(taskMeta?.customFieldValues || {})
      setRecurrence(taskMeta?.recurrence || defaultRecurrence)
      // Fetch members if we have project_id
      if (selectedTask.project_id) {
        fetchMembers(selectedTask.project_id)
      }
    }
  }, [fetchMembers, getTaskMeta, selectedTask])

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeTask() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isOpen || !selectedTask) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const wasCompleted = Boolean(selectedTask.completed)
      const previousSnapshot = useBoardStore.getState().getSnapshot()
      useBoardHistoryStore.getState().record(previousSnapshot)
      await updateTask(selectedTask.id, {
        title, description, priority,
        due_date: dueDate || null,
        label: label || null,
        assignee_id: assigneeId || null,
        completed: completed
      })

      if (selectedTask.project_id) {
        updateRecurrence(selectedTask.project_id, selectedTask.id, recurrence)

        if (completed) {
          setCompletedAt(selectedTask.project_id, selectedTask.id, new Date().toISOString())
        } else {
          setCompletedAt(selectedTask.project_id, selectedTask.id, null)
        }
      }

      if (!wasCompleted && completed && recurrence.enabled && selectedTask.project_id) {
        const nextDueDate = advanceDate(dueDate || selectedTask.due_date || new Date().toISOString(), recurrence.frequency, recurrence.interval)
        const nextTask = await addTask(selectedTask.column_id, title.trim() || selectedTask.title, {
          description,
          priority,
          due_date: nextDueDate,
          label: label || null,
          assignee_id: assigneeId || null,
          completed: false
        })

        updateRecurrence(selectedTask.project_id, nextTask.id, recurrence)
        Object.entries(customFieldValues).forEach(([fieldId, value]) => {
          updateCustomFieldValue(selectedTask.project_id, nextTask.id, fieldId, value)
        })
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      useBoardHistoryStore.getState().discardLast()
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    await deleteTask(selectedTask.id, selectedTask.column_id)
    closeTask()
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    const newComment = {
      id: Date.now(),
      text: comment.trim(),
      time: new Date().toLocaleString()
    }
    setComments([...comments, newComment])
    setComment('')
  }

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !selectedTask?.project_id) return

    for (const file of files) {
      const dataUrl = await readFileAsDataUrl(file)
      const attachment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        createdAt: new Date().toISOString()
      }
      addAttachment(selectedTask.project_id, selectedTask.id, attachment)
      setAttachments((current) => [...current, attachment])
    }

    e.target.value = ''
  }

  const handleAddCustomField = () => {
    if (!selectedTask?.project_id || !newFieldName.trim()) return

    const field = {
      id: `${newFieldName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      options: newFieldType === 'select'
        ? newFieldOptions.split(',').map((item) => item.trim()).filter(Boolean)
        : []
    }

    upsertCustomField(selectedTask.project_id, field)
    setNewFieldName('')
    setNewFieldType('text')
    setNewFieldOptions('')
  }

  const handleCustomFieldChange = (fieldId, value) => {
    if (!selectedTask?.project_id) return
    setCustomFieldValues((current) => ({ ...current, [fieldId]: value }))
    updateCustomFieldValue(selectedTask.project_id, selectedTask.id, fieldId, value)
  }

  const handleRemoveAttachment = (attachmentId) => {
    if (!selectedTask?.project_id) return
    removeAttachment(selectedTask.project_id, selectedTask.id, attachmentId)
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId))
  }

  const handleRecurrenceChange = (updates) => {
    const nextRecurrence = { ...recurrence, ...updates }
    setRecurrence(nextRecurrence)
    if (selectedTask?.project_id) {
      updateRecurrence(selectedTask.project_id, selectedTask.id, nextRecurrence)
    }
  }

  const priorityColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }

  return (
    <>
      <div onClick={closeTask} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)', zIndex: 40,
        backdropFilter: 'blur(2px)'
      }} />

      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: '440px', background: 'var(--surface)', zIndex: 50,
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--surface-2)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            TASK DETAIL
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ESC to close</span>
            <button onClick={closeTask} style={{
              background: 'none', border: 'none',
              fontSize: '1.25rem', cursor: 'pointer',
              color: 'var(--text-secondary)', lineHeight: 1,
              padding: '4px 8px', borderRadius: '6px'
            }}>×</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', letterSpacing: '0.08em' }}>TITLE</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: '0.95rem', fontWeight: '500'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', letterSpacing: '0.08em' }}>DESCRIPTION</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..." rows={3}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: '0.875rem', resize: 'vertical'
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', letterSpacing: '0.08em' }}>PRIORITY</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['low', 'medium', 'high'].map(p => (
                <button key={p} onClick={() => setPriority(p)} style={{
                  flex: 1, padding: '7px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${priority === p ? priorityColors[p] : 'var(--border)'}`,
                  background: priority === p ? priorityColors[p] + '15' : 'var(--surface-2)',
                  color: priority === p ? priorityColors[p] : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                  textTransform: 'capitalize', transition: 'all 0.15s'
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', letterSpacing: '0.08em' }}>LABEL</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {LABELS.map(l => (
                <button key={l} onClick={() => setLabel(label === l ? '' : l)} style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                  border: `1.5px solid ${label === l ? 'var(--primary)' : 'var(--border)'}`,
                  background: label === l ? 'var(--primary)' : 'var(--surface-2)',
                  color: label === l ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s'
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', letterSpacing: '0.08em' }}>DUE DATE</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: '0.9rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              Mark task complete
            </label>

            <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>RECURRING TASK</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Auto-create the next copy when this task is completed.</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text)' }}>
                  <input
                    type="checkbox"
                    checked={recurrence.enabled}
                    onChange={(e) => handleRecurrenceChange({ enabled: e.target.checked })}
                  />
                  Repeat
                </label>
              </div>

              {recurrence.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    value={recurrence.frequency}
                    onChange={(e) => handleRecurrenceChange({ frequency: e.target.value })}
                    style={{
                      padding: '8px 10px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)'
                    }}
                  >
                    {RECURRENCE_FREQUENCIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={recurrence.interval}
                    onChange={(e) => handleRecurrenceChange({ interval: Number(e.target.value) || 1 })}
                    style={{
                      padding: '8px 10px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          {members.length > 0 && (
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px', letterSpacing: '0.08em' }}>ASSIGNEE</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)', color: 'var(--text)',
                  fontSize: '0.875rem'
                }}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user?.email || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>CUSTOM FIELDS</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Project-specific metadata stored with each task locally.</div>
              </div>
              {selectedTask?.project_id && (
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  Add field
                </button>
              )}
            </div>

            {selectedTask?.project_id && (
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Field name"
                  style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                  </select>
                  {newFieldType === 'select' ? (
                    <input
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      placeholder="Options, comma separated"
                      style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 10px', color: 'var(--text-tertiary)', fontSize: '0.8rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                      {newFieldType === 'text' ? 'Free text field' : newFieldType === 'number' ? 'Numeric field' : 'Date field'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {projectCustomFields.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No custom fields yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {projectCustomFields.map((field) => (
                  <div key={field.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{field.name}</strong>
                      <button type="button" onClick={() => removeCustomField(selectedTask.project_id, field.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>×</button>
                    </div>
                    {field.type === 'select' ? (
                      <select
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                      >
                        <option value="">Select...</option>
                        {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                      />
                    ) : field.type === 'date' ? (
                      <input
                        type="date"
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>ATTACHMENTS</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload files and keep them with the task.</div>
              </div>
              <label style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                Upload
                <input type="file" multiple onChange={handleAttachmentUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No attachments uploaded.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {attachments.map((attachment) => (
                  <div key={attachment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{Math.round(attachment.size / 1024)} KB</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={attachment.dataUrl} download={attachment.name} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Open</a>
                      <button type="button" onClick={() => handleRemoveAttachment(attachment.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px', letterSpacing: '0.08em' }}>
              COMMENTS ({comments.length})
            </label>

            {comments.map(c => (
              <div key={c.id} style={{
                background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
                padding: '8px 10px', marginBottom: '6px',
                border: '1px solid var(--border)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', marginBottom: '4px' }}>{c.text}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{c.time}</p>
              </div>
            ))}

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <input
                value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)', color: 'var(--text)',
                  fontSize: '0.875rem'
                }}
              />
              <button type="submit" style={{
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--primary)', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: '0.875rem'
              }}>Post</button>
            </form>
          </div>

          {/* Meta */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            Created: {new Date(selectedTask.created_at).toLocaleString()}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.25rem', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '8px', background: 'var(--surface-2)'
        }}>
          <button onClick={handleDelete} style={{
            padding: '8px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--danger)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500'
          }}>
            🗑 Delete
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, padding: '8px', borderRadius: 'var(--radius-md)',
            background: saved ? 'var(--success)' : 'var(--primary)',
            color: 'white', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem', fontWeight: '600',
            transition: 'background 0.2s'
          }}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}