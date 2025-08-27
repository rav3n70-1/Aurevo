import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Tag, 
  Calendar,
  Edit3,
  Trash2,
  Save,
  X,
  StickyNote,
  Filter,
  Clock,
  Star,
  Archive
} from 'lucide-react'
import { useAppStore } from '../store'

const NOTE_CATEGORIES = [
  'Lecture Notes', 'Research', 'Assignments', 'Ideas', 'Reviews',
  'Formulas', 'Definitions', 'Examples', 'Questions', 'Summary'
]

const SAMPLE_NOTES = [
  {
    id: 1,
    title: 'Machine Learning Fundamentals',
    content: 'Key concepts:\n• Supervised vs Unsupervised Learning\n• Overfitting and regularization\n• Cross-validation techniques\n• Feature engineering importance',
    category: 'Lecture Notes',
    tags: ['ML', 'AI', 'fundamentals'],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    isPinned: true
  },
  {
    id: 2,
    title: 'Linear Algebra Review',
    content: 'Matrix operations review:\n• Matrix multiplication rules\n• Eigenvalues and eigenvectors\n• Determinants and inverses\n• Applications in ML',
    category: 'Reviews',
    tags: ['math', 'linear-algebra'],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    isPinned: false
  }
]

export default function StudyNotes() {
  const { t } = useTranslation()
  const { darkMode, addXP } = useAppStore()
  
  const [notes, setNotes] = useState(SAMPLE_NOTES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'Lecture Notes',
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const createNote = () => {
    if (!newNote.title || !newNote.content) return

    const note = {
      id: Date.now(),
      ...newNote,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false
    }

    setNotes(prev => [note, ...prev])
    setNewNote({ title: '', content: '', category: 'Lecture Notes', tags: [] })
    setShowCreateForm(false)
    addXP(25)
  }

  const updateNote = () => {
    if (!editingNote.title || !editingNote.content) return

    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...editingNote, updatedAt: new Date() }
        : note
    ))
    setEditingNote(null)
    addXP(15)
  }

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  const togglePin = (id) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ))
  }

  const addTag = (noteData, setNoteData) => {
    if (newTag && !noteData.tags.includes(newTag)) {
      setNoteData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove, noteData, setNoteData) => {
    setNoteData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const formatDate = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  const NoteCard = ({ note }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
        note.isPinned
          ? darkMode 
            ? 'bg-yellow-900/20 border-yellow-500/50' 
            : 'bg-yellow-50 border-yellow-200'
          : darkMode 
            ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => setEditingNote({ ...note })}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {note.title}
            </h3>
            {note.isPinned && (
              <Star className="text-yellow-500" size={16} fill="currentColor" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${
              darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {note.category}
            </span>
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDate(note.updatedAt)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePin(note.id)
            }}
            className={`p-1 rounded transition-colors ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
          >
            <Star 
              size={14} 
              className={note.isPinned ? 'text-yellow-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}
              fill={note.isPinned ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteNote(note.id)
            }}
            className={`p-1 rounded transition-colors ${
              darkMode ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-100 text-red-500'
            }`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className={`text-sm line-clamp-3 mb-3 ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {note.content}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 text-xs rounded ${
                darkMode 
                  ? 'bg-purple-900/50 text-purple-300' 
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )

  const NoteForm = ({ noteData, setNoteData, onSave, onCancel, isEditing }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {isEditing ? 'Edit Note' : 'Create New Note'}
            </h2>
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Title
            </label>
            <input
              type="text"
              placeholder="Enter note title..."
              value={noteData.title}
              onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Category
            </label>
            <select
              value={noteData.category}
              onChange={(e) => setNoteData(prev => ({ ...prev, category: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {NOTE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {noteData.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-purple-900/50 text-purple-300' 
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag, noteData, setNoteData)}
                    className="hover:bg-red-500/20 rounded"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag(noteData, setNoteData)}
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                onClick={() => addTag(noteData, setNoteData)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-500' 
                    : 'bg-purple-500 text-white hover:bg-purple-400'
                }`}
              >
                Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Content
            </label>
            <textarea
              placeholder="Write your notes here..."
              value={noteData.content}
              onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
              rows={10}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <motion.button
              onClick={onSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                darkMode 
                  ? 'bg-green-600 text-white hover:bg-green-500' 
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              <Save size={20} />
              {isEditing ? 'Update Note' : 'Create Note'}
            </motion.button>
            <button
              onClick={onCancel}
              className={`px-6 py-3 rounded-lg font-semibold ${
                darkMode 
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return b.isPinned - a.isPinned
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return (
    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <StickyNote className="text-orange-500" size={20} />
          Study Notes
        </h3>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            darkMode 
              ? 'bg-orange-600 text-white hover:bg-orange-500' 
              : 'bg-orange-500 text-white hover:bg-orange-400'
          }`}
        >
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="All">All Categories</option>
          {NOTE_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${
        darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {notes.length}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Notes
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {notes.filter(n => n.isPinned).length}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Pinned
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {new Set(notes.flatMap(n => n.tags)).size}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Tags
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </AnimatePresence>
      </div>

      {sortedNotes.length === 0 && (
        <div className="text-center py-8">
          <StickyNote size={48} className={`mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchQuery || selectedCategory !== 'All' 
              ? 'No notes match your search criteria'
              : 'No notes yet. Create your first note to get started!'
            }
          </p>
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showCreateForm && (
          <NoteForm
            noteData={newNote}
            setNoteData={setNewNote}
            onSave={createNote}
            onCancel={() => setShowCreateForm(false)}
            isEditing={false}
          />
        )}
      </AnimatePresence>

      {/* Edit Form */}
      <AnimatePresence>
        {editingNote && (
          <NoteForm
            noteData={editingNote}
            setNoteData={setEditingNote}
            onSave={updateNote}
            onCancel={() => setEditingNote(null)}
            isEditing={true}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 