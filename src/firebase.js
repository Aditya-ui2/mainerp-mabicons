// Firebase Configuration for Mabicons ERP
import { initializeApp } from 'firebase/app';
import { getAuth, OAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration - mabicons project
const firebaseConfig = {
  apiKey: "AIzaSyCdQ56IOMebdPdRWKGTU4-6WaokSXBIgKQ", // Replace with actual API key from Firebase Project Settings
  authDomain: "mabicons-1307f.firebaseapp.com",
  projectId: "mabicons-1307f",
  storageBucket: "mabicons-1307f.appspot.com",
  messagingSenderId: "247610184181",
  appId: "1:247610184181:web:b97bb72d76973e52c290bc" // From Project settings screenshot
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Apple Sign-In Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Sign in with Apple
export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    const credential = OAuthProvider.credentialFromResult(result);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'Apple User',
        photoURL: user.photoURL,
        provider: 'apple'
      },
      token: credential?.accessToken
    };
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};

export default app;
