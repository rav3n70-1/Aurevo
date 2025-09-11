import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'

export default function Kanban() {
  const { darkMode } = useAppStore()
  const { goals, setGoalStatus } = useTaskStore()

  const columns = [
    { id: 'not_started', title: 'Backlog' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'blocked', title: 'Blocked' },
    { id: 'completed', title: 'Done' }
  ]

  const moveTo = async (goalId, status) => {
    await setGoalStatus(goalId, status)
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
            <h1 className="text-xl font-semibold mb-4">Kanban</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {columns.map(col => (
                <div key={col.id} className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="text-sm font-medium mb-2">{col.title}</div>
                  <div className="space-y-2">
                    {goals.filter(g => (g.status || (g.completed ? 'completed' : 'not_started')) === col.id).map(g => (
                      <div key={g.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="text-sm font-medium">{g.title}</div>
                        <div className="text-xs opacity-70 mb-2">{Math.round(g.progress || 0)}%</div>
                        <div className="flex gap-1">
                          {columns.map(c => (
                            <button key={c.id} onClick={() => moveTo(g.id, c.id)} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{c.title.split(' ')[0]}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 