import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

export const isLocalFirebase = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'

const firebaseConfig = isLocalFirebase
  ? {
      apiKey: 'demo-bardos-local-key',
      authDomain: 'demo-bardos-local.firebaseapp.com',
      projectId: 'demo-bardos-local',
      storageBucket: 'demo-bardos-local.appspot.com',
      appId: 'demo-bardos-local',
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }

// Only initialize when a project id is configured so the template runs
// (and builds) before Firebase credentials are filled in.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app: FirebaseApp | null = isConfigured ? initializeApp(firebaseConfig) : null
export const auth: Auth | null = app ? getAuth(app) : null
export const db: Firestore | null = app ? getFirestore(app) : null
export const storage: FirebaseStorage | null = app ? getStorage(app) : null
export const functions = app ? getFunctions(app, 'us-central1') : null
if (app && !isLocalFirebase && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  })
}

if (isLocalFirebase && auth && db && storage && functions) {
  connectAuthEmulator(auth, `http://127.0.0.1:${import.meta.env.VITE_LOCAL_AUTH_PORT || 9099}`, {
    disableWarnings: true,
  })
  connectFirestoreEmulator(
    db,
    '127.0.0.1',
    Number(import.meta.env.VITE_LOCAL_FIRESTORE_PORT || 8080),
  )
  connectStorageEmulator(
    storage,
    '127.0.0.1',
    Number(import.meta.env.VITE_LOCAL_STORAGE_PORT || 9199),
  )
  connectFunctionsEmulator(
    functions,
    '127.0.0.1',
    Number(import.meta.env.VITE_LOCAL_FUNCTIONS_PORT || 5001),
  )
}

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    '[firebase] No VITE_FIREBASE_* config found. Copy .env.example to .env.local and fill it in.',
  )
}
