import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTaskStore } from '../store'
import { useState } from 'react'

export default function Views() {
  const { darkMode } = useAppStore()
  const { savedViews, saveView } = useTaskStore()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')

  const onSave = async () => {
    if (!name) return
    await saveView({ name, query })
    setName('')
    setQuery('')
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
            <h1 className="text-xl font-semibold mb-4">Saved Views</h1>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Create View</div>
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <input className={`w-full mb-2 px-3 py-2 rounded ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`} placeholder="Query (e.g. tag:work status:in_progress)" value={query} onChange={e => setQuery(e.target.value)} />
                <button onClick={onSave} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Save</button>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} p-3 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">My Views</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {savedViews.map(v => (
                    <div key={v.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs opacity-70 truncate">{v.query}</div>
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