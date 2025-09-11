import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAppStore, useAttachmentsStore } from '../store'

export default function Attachments() {
  const { darkMode } = useAppStore()
  const { attachments, uploadAttachment } = useAttachmentsStore()

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const goalId = prompt('Attach to Goal ID (optional):') || null
    await uploadAttachment(goalId, file)
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
            <h1 className="text-xl font-semibold mb-4">Attachments</h1>

            <label className={`px-3 py-1.5 rounded text-sm cursor-pointer ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              Upload File
              <input type="file" className="hidden" onChange={onUpload} />
            </label>

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              {attachments.map(a => (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="text-sm font-medium truncate">{a.fileName}</div>
                  <div className="text-xs opacity-70">{(a.fileSize / 1024).toFixed(1)} KB</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 