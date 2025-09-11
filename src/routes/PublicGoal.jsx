import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { COLLECTIONS, db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function PublicGoal() {
  const { id } = useParams()
  const [goal, setGoal] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.GOALS, id))
        if (snap.exists()) setGoal({ id, ...snap.data() })
        else setError('Not found')
      } catch (e) {
        setError('Failed to load')
      }
    })()
  }, [id])

  if (error) return <div className="p-6">{error}</div>
  if (!goal) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{goal.title}</h1>
      <p className="opacity-80 mb-2">{goal.description}</p>
      <div className="text-sm opacity-70">Progress: {Math.round(goal.progress || 0)}%</div>
    </div>
  )
} 