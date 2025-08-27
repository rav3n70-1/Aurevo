
/**
 * Google Photos and free image APIs integration
 * Provides access to Google Photos library and free stock images
 */

// API Configuration
const GOOGLE_PHOTOS_SCOPE = 'https://www.googleapis.com/auth/photoslibrary.readonly'
const UNSPLASH_ACCESS_KEY = import.meta.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'your-unsplash-key'
const PEXELS_API_KEY = import.meta.env.REACT_APP_PEXELS_API_KEY || 'your-pexels-key'

let gapi = null
let isPhotosInitialized = false

// Check if Google Photos is configured
const isGooglePhotosConfigured = () => {
  return import.meta.env.REACT_APP_GOOGLE_CLIENT_ID && 
         import.meta.env.REACT_APP_GOOGLE_CLIENT_ID !== 'your-client-id'
}

/**
 * Initialize Google Photos API
 */
export async function initGooglePhotos() {
  try {
    if (!isGooglePhotosConfigured()) {
      throw new Error('Google Photos API not configured. Please update your .env file with valid REACT_APP_GOOGLE_CLIENT_ID')
    }

    if (!window.gapi) {
      await loadGoogleAPI()
    }
    
    gapi = window.gapi
    
    if (!isPhotosInitialized) {
      await gapi.load('auth2:client', async () => {
        await gapi.client.init({
          clientId: import.meta.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: GOOGLE_PHOTOS_SCOPE,
          discoveryDocs: ['https://photoslibrary.googleapis.com/$discovery/rest?version=v1']
        })
        isPhotosInitialized = true
      })
    }

    // Check if user is already signed in
    const authInstance = gapi.auth2.getAuthInstance()
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn({
        scope: GOOGLE_PHOTOS_SCOPE
      })
    }

    return true
  } catch (error) {
    console.error('Failed to initialize Google Photos:', error)
    throw new Error('Google Photos initialization failed: ' + error.message)
  }
}

/**
 * Load Google API script
 */
function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve(window.gapi)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => resolve(window.gapi)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * Pick a photo from Google Photos
 * Opens a photo picker interface
 */
export async function pickPhoto() {
  try {
    if (!isPhotosInitialized) {
      await initGooglePhotos()
    }

    // Get user's photos
    const photos = await listGooglePhotos(20)
    
    return new Promise((resolve, reject) => {
      // Create a modal photo picker
      const modal = createPhotoPickerModal(photos, resolve, reject)
      document.body.appendChild(modal)
    })
  } catch (error) {
    console.error('Failed to pick photo:', error)
    throw error
  }
}

/**
 * List photos from Google Photos
 * @param {number} maxResults - Maximum number of photos to retrieve
 */
export async function listGooglePhotos(maxResults = 50) {
  try {
    if (!isPhotosInitialized) {
      await initGooglePhotos()
    }

    const response = await gapi.client.photoslibrary.mediaItems.list({
      pageSize: maxResults
    })

    return response.result.mediaItems?.map(item => ({
      id: item.id,
      filename: item.filename,
      description: item.description,
      mimeType: item.mimeType,
      creationTime: item.mediaMetadata.creationTime,
      width: item.mediaMetadata.width,
      height: item.mediaMetadata.height,
      baseUrl: item.baseUrl,
      thumbnailUrl: `${item.baseUrl}=w200-h200-c`,
      fullUrl: `${item.baseUrl}=w1024-h1024`
    })) || []
  } catch (error) {
    console.error('Failed to list Google Photos:', error)
    throw error
  }
}

/**
 * Create photo picker modal
 */
function createPhotoPickerModal(photos, resolve, reject) {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Select a Photo</h3>
          <button id="close-picker" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4 overflow-y-auto max-h-96">
        <div class="grid grid-cols-3 md:grid-cols-4 gap-3" id="photos-grid">
          ${photos.map(photo => `
            <div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all" data-photo-id="${photo.id}">
              <img src="${photo.thumbnailUrl}" alt="${photo.filename}" class="w-full h-full object-cover">
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `

  // Add event listeners
  modal.querySelector('#close-picker').addEventListener('click', () => {
    document.body.removeChild(modal)
    reject(new Error('Photo selection cancelled'))
  })

  modal.querySelectorAll('[data-photo-id]').forEach(photoEl => {
    photoEl.addEventListener('click', () => {
      const photoId = photoEl.dataset.photoId
      const selectedPhoto = photos.find(p => p.id === photoId)
      document.body.removeChild(modal)
      resolve(selectedPhoto)
    })
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
      reject(new Error('Photo selection cancelled'))
    }
  })

  return modal
}

/**
 * Search free stock photos from Unsplash
 * @param {string} query - Search query
 * @param {number} perPage - Number of photos per page
 * @param {number} page - Page number
 */
export async function searchUnsplashPhotos(query, perPage = 30, page = 1) {
  try {
    if (UNSPLASH_ACCESS_KEY === 'your-unsplash-key') {
      throw new Error('Unsplash API key not configured')
    }

    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      total: data.total,
      totalPages: data.total_pages,
      results: data.results.map(photo => ({
        id: photo.id,
        description: photo.description || photo.alt_description,
        urls: {
          raw: photo.urls.raw,
          full: photo.urls.full,
          regular: photo.urls.regular,
          small: photo.urls.small,
          thumb: photo.urls.thumb
        },
        width: photo.width,
        height: photo.height,
        color: photo.color,
        user: {
          name: photo.user.name,
          username: photo.user.username,
          profileImage: photo.user.profile_image.medium
        },
        downloadUrl: photo.links.download_location
      }))
    }
  } catch (error) {
    console.error('Failed to search Unsplash photos:', error)
    throw error
  }
}

/**
 * Search free stock photos from Pexels
 * @param {string} query - Search query
 * @param {number} perPage - Number of photos per page
 * @param {number} page - Page number
 */
export async function searchPexelsPhotos(query, perPage = 30, page = 1) {
  try {
    if (PEXELS_API_KEY === 'your-pexels-key') {
      throw new Error('Pexels API key not configured')
    }

    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      total: data.total_results,
      totalPages: Math.ceil(data.total_results / perPage),
      results: data.photos.map(photo => ({
        id: photo.id,
        description: photo.alt,
        urls: {
          original: photo.src.original,
          large: photo.src.large,
          medium: photo.src.medium,
          small: photo.src.small,
          thumb: photo.src.tiny
        },
        width: photo.width,
        height: photo.height,
        avgColor: photo.avg_color,
        photographer: {
          name: photo.photographer,
          url: photo.photographer_url
        },
        pageUrl: photo.url
      }))
    }
  } catch (error) {
    console.error('Failed to search Pexels photos:', error)
    throw error
  }
}

/**
 * Get featured photos from Unsplash
 * @param {number} perPage - Number of photos per page
 * @param {number} page - Page number
 */
export async function getFeaturedPhotos(perPage = 30, page = 1) {
  try {
    if (UNSPLASH_ACCESS_KEY === 'your-unsplash-key') {
      throw new Error('Unsplash API key not configured')
    }

    const response = await fetch(`https://api.unsplash.com/photos?per_page=${perPage}&page=${page}&order_by=popular`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`)
    }

    const photos = await response.json()
    
    return photos.map(photo => ({
      id: photo.id,
      description: photo.description || photo.alt_description,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb
      },
      width: photo.width,
      height: photo.height,
      color: photo.color,
      user: {
        name: photo.user.name,
        username: photo.user.username,
        profileImage: photo.user.profile_image.medium
      },
      downloadUrl: photo.links.download_location
    }))
  } catch (error) {
    console.error('Failed to get featured photos:', error)
    throw error
  }
}

/**
 * Download a photo from a URL
 * @param {string} url - Photo URL
 * @param {string} filename - Filename for download
 */
export async function downloadPhoto(url, filename) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename || 'photo.jpg'
    a.click()
    
    URL.revokeObjectURL(downloadUrl)
    return true
  } catch (error) {
    console.error('Failed to download photo:', error)
    throw error
  }
}

/**
 * Create a comprehensive photo picker with multiple sources
 * @param {function} onSelect - Callback when photo is selected
 * @param {object} options - Configuration options
 */
export async function createPhotoLibrary(onSelect, options = {}) {
  const {
    enableGooglePhotos = true,
    enableStockPhotos = true,
    defaultTab = 'stock'
  } = options

  try {
    // Initialize available services
    const services = []
    
    if (enableGooglePhotos) {
      try {
        await initGooglePhotos()
        services.push('google')
      } catch (error) {
        console.warn('Google Photos not available:', error.message)
      }
    }
    
    if (enableStockPhotos) {
      services.push('stock')
    }

    if (services.length === 0) {
      throw new Error('No photo services available')
    }

    return new Promise((resolve, reject) => {
      const modal = createPhotoLibraryModal(services, defaultTab, resolve, reject, onSelect)
      document.body.appendChild(modal)
    })
  } catch (error) {
    console.error('Failed to create photo library:', error)
    throw error
  }
}

/**
 * Create comprehensive photo library modal
 */
function createPhotoLibraryModal(services, defaultTab, resolve, reject, onSelect) {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
  
  // This would be a more complex implementation with tabs, search, etc.
  // For brevity, showing simplified version
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">Photo Library</h3>
          <button id="close-library" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Search Bar -->
        <div class="flex gap-3">
          <input type="text" id="photo-search" placeholder="Search for photos..." class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <button id="search-btn" class="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-400">Search</button>
        </div>
        
        <!-- Tabs -->
        <div class="flex gap-2 mt-4" id="photo-tabs">
          ${services.includes('stock') ? '<button class="tab-btn px-4 py-2 rounded-lg bg-violet-500 text-white" data-tab="stock">Stock Photos</button>' : ''}
          ${services.includes('google') ? '<button class="tab-btn px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300" data-tab="google">Google Photos</button>' : ''}
        </div>
      </div>
      
      <div class="p-4 overflow-y-auto" style="max-height: calc(90vh - 200px)">
        <div id="photos-container" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <!-- Photos will be loaded here -->
        </div>
        <div id="loading" class="text-center py-8 hidden">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Loading photos...</p>
        </div>
      </div>
    </div>
  `

  // Add functionality (simplified)
  const loadStockPhotos = async (query = 'nature') => {
    const container = modal.querySelector('#photos-container')
    const loading = modal.querySelector('#loading')
    
    loading.classList.remove('hidden')
    container.innerHTML = ''
    
    try {
      const photos = await searchUnsplashPhotos(query, 20)
      loading.classList.add('hidden')
      
      container.innerHTML = photos.results.map(photo => `
        <div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all" data-photo='${JSON.stringify(photo)}'>
          <img src="${photo.urls.small}" alt="${photo.description}" class="w-full h-full object-cover">
        </div>
      `).join('')
      
      // Add click handlers
      container.querySelectorAll('[data-photo]').forEach(photoEl => {
        photoEl.addEventListener('click', () => {
          const photo = JSON.parse(photoEl.dataset.photo)
          document.body.removeChild(modal)
          resolve(photo)
          if (onSelect) onSelect(photo)
        })
      })
    } catch (error) {
      loading.classList.add('hidden')
      container.innerHTML = '<p class="text-center text-red-500">Failed to load photos</p>'
    }
  }

  // Initialize with default photos
  loadStockPhotos()

  // Add event listeners
  modal.querySelector('#close-library').addEventListener('click', () => {
    document.body.removeChild(modal)
    reject(new Error('Photo selection cancelled'))
  })

  modal.querySelector('#search-btn').addEventListener('click', () => {
    const query = modal.querySelector('#photo-search').value
    loadStockPhotos(query || 'nature')
  })

  modal.querySelector('#photo-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value
      loadStockPhotos(query || 'nature')
    }
  })

  return modal
}

/**
 * Check if Google Photos is available and authenticated
 */
export function isGooglePhotosAuthenticated() {
  try {
    if (!isPhotosInitialized || !gapi) return false
    const authInstance = gapi.auth2.getAuthInstance()
    return authInstance && authInstance.isSignedIn.get()
  } catch {
    return false
  }
}
