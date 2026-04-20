import Board from '../features/board/Board'

export default function BoardPage({ project }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        {project.name}
      </h2>
      <Board project={project} />
    </div>
  )
}