
/**
 * Google Drive integration with OAuth 2.0
 * Provides file upload, download, and management capabilities
 */

// Google API configuration
const GOOGLE_API_KEY = import.meta.env.REACT_APP_GOOGLE_API_KEY || 'your-api-key'
const CLIENT_ID = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-client-id'
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
const SCOPES = 'https://www.googleapis.com/auth/drive.file'

let gapi = null
let isInitialized = false

// Check if Google API credentials are configured
const isGoogleApiConfigured = () => {
  return GOOGLE_API_KEY !== 'your-api-key' && CLIENT_ID !== 'your-client-id'
}

/**
 * Initialize Google Drive API
 */
export async function initDrive() {
  try {
    if (!isGoogleApiConfigured()) {
      throw new Error('Google Drive API credentials not configured. Please update your .env file with valid REACT_APP_GOOGLE_API_KEY and REACT_APP_GOOGLE_CLIENT_ID')
    }

    // Load Google API script if not already loaded
    if (!window.gapi) {
      await loadGoogleAPI()
    }
    
    gapi = window.gapi
    
    if (!isInitialized) {
      await gapi.load('auth2:client', async () => {
        await gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        })
        isInitialized = true
      })
    }

    // Check if user is already signed in
    const authInstance = gapi.auth2.getAuthInstance()
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn()
    }

    return true
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error)
    throw new Error('Google Drive initialization failed: ' + error.message)
  }
}

/**
 * Load Google API script dynamically
 */
function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve(window.gapi)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      // Also load the auth2 library
      const authScript = document.createElement('script')
      authScript.src = 'https://apis.google.com/js/platform.js'
      authScript.onload = () => resolve(window.gapi)
      authScript.onerror = reject
      document.head.appendChild(authScript)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * Upload a file to Google Drive
 * @param {File} file - The file to upload
 * @param {string} folderId - Optional folder ID to upload to
 * @param {function} onProgress - Progress callback
 */
export async function uploadToDrive(file, folderId = null, onProgress = null) {
  try {
    if (!isInitialized) {
      await initDrive()
    }

    const metadata = {
      name: file.name,
      parents: folderId ? [folderId] : undefined,
      description: `Uploaded from Aurevo on ${new Date().toISOString()}`
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
      }),
      body: form
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Make file accessible via link
    await gapi.client.drive.permissions.create({
      fileId: result.id,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    })

    return {
      id: result.id,
      name: result.name,
      webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
      webContentLink: `https://drive.google.com/uc?id=${result.id}`,
      size: file.size,
      mimeType: file.type,
      createdTime: new Date().toISOString()
    }
  } catch (error) {
    console.error('Upload to Drive failed:', error)
    throw error
  }
}

/**
 * List files from Google Drive
 * @param {string} query - Search query (optional)
 * @param {number} maxResults - Maximum number of results
 */
export async function listDriveFiles(query = null, maxResults = 50) {
  try {
    if (!isInitialized) {
      await initDrive()
    }

    let searchQuery = "trashed=false"
    if (query) {
      searchQuery += ` and name contains '${query}'`
    }

    const response = await gapi.client.drive.files.list({
      q: searchQuery,
      pageSize: maxResults,
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents)',
      orderBy: 'modifiedTime desc'
    })

    return response.result.files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size) || 0,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder'
    }))
  } catch (error) {
    console.error('Failed to list Drive files:', error)
    throw error
  }
}

/**
 * Create a folder in Google Drive
 * @param {string} name - Folder name
 * @param {string} parentId - Parent folder ID (optional)
 */
export async function createDriveFolder(name, parentId = null) {
  try {
    if (!isInitialized) {
      await initDrive()
    }

    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    }

    const response = await gapi.client.drive.files.create({
      resource: metadata
    })

    return {
      id: response.result.id,
      name: response.result.name,
      webViewLink: `https://drive.google.com/drive/folders/${response.result.id}`
    }
  } catch (error) {
    console.error('Failed to create folder:', error)
    throw error
  }
}

/**
 * Download a file from Google Drive
 * @param {string} fileId - File ID
 */
export async function downloadFromDrive(fileId) {
  try {
    if (!isInitialized) {
      await initDrive()
    }

    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    })

    return response.body
  } catch (error) {
    console.error('Failed to download file:', error)
    throw error
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - File ID
 */
export async function deleteFromDrive(fileId) {
  try {
    if (!isInitialized) {
      await initDrive()
    }

    await gapi.client.drive.files.delete({
      fileId: fileId
    })

    return true
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw error
  }
}

/**
 * Get user's Drive storage info
 */
export async function getDriveStorageInfo() {
  try {
    if (!isInitialized) {
      await initDrive()
    }

    const response = await gapi.client.drive.about.get({
      fields: 'storageQuota,user'
    })

    const quota = response.result.storageQuota
    return {
      limit: parseInt(quota.limit),
      usage: parseInt(quota.usage),
      usageInDrive: parseInt(quota.usageInDrive),
      usageInDriveTrash: parseInt(quota.usageInDriveTrash),
      user: response.result.user
    }
  } catch (error) {
    console.error('Failed to get storage info:', error)
    throw error
  }
}

/**
 * Check if user is authenticated with Google Drive
 */
export function isDriveAuthenticated() {
  try {
    if (!isInitialized || !gapi) return false
    const authInstance = gapi.auth2.getAuthInstance()
    return authInstance && authInstance.isSignedIn.get()
  } catch {
    return false
  }
}

/**
 * Sign out from Google Drive
 */
export async function signOutFromDrive() {
  try {
    if (!isInitialized || !gapi) return
    const authInstance = gapi.auth2.getAuthInstance()
    if (authInstance) {
      await authInstance.signOut()
    }
  } catch (error) {
    console.error('Failed to sign out from Drive:', error)
  }
}

/**
 * Export app data to Google Drive
 * @param {object} data - Data to export
 * @param {string} filename - Export filename
 */
export async function exportDataToDrive(data, filename = 'aurevo-backup.json') {
  try {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const file = new File([blob], filename, { type: 'application/json' })

    // Create Aurevo folder if it doesn't exist
    const files = await listDriveFiles('Aurevo')
    let folderId = null
    
    const aurevoFolder = files.find(f => f.name === 'Aurevo' && f.isFolder)
    if (!aurevoFolder) {
      const folder = await createDriveFolder('Aurevo')
      folderId = folder.id
    } else {
      folderId = aurevoFolder.id
    }

    return await uploadToDrive(file, folderId)
  } catch (error) {
    console.error('Failed to export data to Drive:', error)
    throw error
  }
}
