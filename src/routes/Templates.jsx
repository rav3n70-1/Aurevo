import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useTemplatesStore, useTaskStore } from '../store'

export default function Templates() {
  const { darkMode } = useAppStore()
  const { templates, userTemplates, loadPublicTemplates, createTemplate } = useTemplatesStore()
  const { createFromTemplate } = useTaskStore()

  const importTemplates = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        for (const t of data) {
          await createTemplate(t)
        }
      }
      alert('Imported templates')
    } catch (err) {
      alert('Invalid JSON')
    }
  }

  const exportMyTemplates = async () => {
    const blob = new Blob([JSON.stringify(userTemplates, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'templates.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
            <h1 className="text-xl font-semibold mb-4">Templates</h1>

            <div className="flex gap-2 mb-4">
              <button onClick={loadPublicTemplates} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Load Public</button>
              <button onClick={exportMyTemplates} className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Export My Templates</button>
              <label className={`px-3 py-1.5 rounded text-sm cursor-pointer ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={importTemplates} />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">Public Templates</div>
                <div className="space-y-2">
                  {templates.map(t => (
                    <div key={t.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium">{t.title}</div>
                      <button onClick={() => createFromTemplate(t.id)} className={`mt-2 px-2 py-1 rounded text-xs ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Use Template</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium mb-2">My Templates</div>
                <div className="space-y-2">
                  {userTemplates.map(t => (
                    <div key={t.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm font-medium">{t.title}</div>
                      <button onClick={() => createFromTemplate(t.id)} className={`mt-2 px-2 py-1 rounded text-xs ${darkMode ? 'bg-violet-600' : 'bg-violet-500 text-white'}`}>Use Template</button>
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