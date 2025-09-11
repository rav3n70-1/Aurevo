import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useCollaborationStore } from '../store'
import { useState, useMemo } from 'react'

export default function Collaboration() {
  const { darkMode } = useAppStore()
  const { addComment, shareGoal, comments, sharedGoals } = useCollaborationStore()
  const [goalId, setGoalId] = useState('')
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')

  const submitComment = async () => {
    if (!goalId || !comment) return
    await addComment(goalId, comment)
    setComment('')
  }

  const submitShare = async () => {
    if (!goalId || !email) return
    await shareGoal(goalId, email, 'view')
    setEmail('')
  }

  const filteredComments = useMemo(() => comments.filter(c => !goalId || c.goalId === goalId), [comments, goalId])

  const revokeShare = async (shareId) => {
    // naive local revoke demo
    // In a full impl, call store method to set isActive=false
    alert('Revoke not fully implemented in store; stub here.')
  }

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h1 className="text-xl font-semibold mb-4">Collaboration</h1>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Add Comment</div>
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Goal ID" value={goalId} onChange={e => setGoalId(e.target.value)} />
                <textarea className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} />
                <button onClick={submitComment} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Post</button>
                <div className="mt-3 text-xs opacity-70">Supports @mentions.</div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Share Goal</div>
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Goal ID" value={goalId} onChange={e => setGoalId(e.target.value)} />
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Collaborator Email" value={email} onChange={e => setEmail(e.target.value)} />
                <button onClick={submitShare} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Share</button>
                <div className="mt-3 text-xs opacity-70">Creates a share entry with view permission.</div>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Recent Comments</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {filteredComments.map(c => (
                    <div key={c.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-xs opacity-70 mb-1">Goal: {c.goalId}</div>
                      <div className="text-sm">{c.content}</div>
                      <div className="text-xs opacity-70">{new Date(c.timestamp?.toDate?.() || c.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Shares</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {sharedGoals.map(s => (
                    <div key={s.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm">{s.collaboratorEmail}</div>
                      <div className="text-xs opacity-70">{s.permissions}</div>
                      <button onClick={() => revokeShare(s.id)} className={`mt-2 px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Revoke</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 