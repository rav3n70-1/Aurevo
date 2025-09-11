import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'

export default function Export() {
  const { darkMode } = useAppStore()
  const { exportGoalsToCSV, exportGoalsToJSON } = useTaskStore()

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}>
      <div className="max-w-7xl mx-auto p-4">
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-1">
            <Sidebar />
          </div>
          <div className={`md:col-span-3 rounded-2xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h1 className="text-xl font-semibold mb-4">Export</h1>
            <div className="flex gap-2">
              <button onClick={exportGoalsToCSV} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Export CSV</button>
              <button onClick={exportGoalsToJSON} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Export JSON</button>
            </div>
            <div className="mt-4 text-sm opacity-70">Encrypted notes and version history to be added.</div>
          </div>
        </div>
      </div>
    </div>
  )
} 