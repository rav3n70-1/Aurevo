import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useFocusStore, useTaskStore } from '../store'
import { useState } from 'react'

export default function Focus() {
  const { darkMode } = useAppStore()
  const { goals } = useTaskStore()
  const { currentSession, isActive, timeRemaining, settings, startFocusSession, completeFocusSession, pauseSession, resumeSession, stopSession } = useFocusStore()
  const [selectedGoal, setSelectedGoal] = useState('')
  const [duration, setDuration] = useState(settings.focusDuration)

  const start = async () => {
    const goalId = selectedGoal || null
    await startFocusSession(goalId, Number(duration))
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h1 className="text-xl font-semibold mb-4">Focus Sessions</h1>

            {!isActive ? (
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Link Goal (optional)</div>
                    <select className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)}>
                      <option value="">None</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Duration (minutes)</div>
                    <input type="number" min={5} step={5} className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={start} className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Start Session</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-6 rounded-xl border text-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm opacity-70 mb-1">Current Session</div>
                <div className="text-5xl font-bold mb-2">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</div>
                {currentSession?.goalId && <div className="text-sm mb-4">Linked Goal: {goals.find(g => g.id === currentSession.goalId)?.title || currentSession.goalId}</div>}
                <div className="flex items-center gap-2 justify-center">
                  <button onClick={pauseSession} className={`px-3 py-2 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Pause</button>
                  <button onClick={resumeSession} className={`px-3 py-2 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Resume</button>
                  <button onClick={completeFocusSession} className={`px-3 py-2 rounded text-sm ${darkMode ? 'bg-green-600' : 'bg-green-500 text-white'}`}>Complete</button>
                  <button onClick={stopSession} className={`px-3 py-2 rounded text-sm ${darkMode ? 'bg-red-700' : 'bg-red-500 text-white'}`}>Stop</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
} 