// Firebase Configuration for Mabicons ERP
import { initializeApp } from 'firebase/app';
import { getAuth, OAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration - DataInsights project
const firebaseConfig = {
  apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual API key
  authDomain: "datainsights-ce470.firebaseapp.com",
  projectId: "datainsights-ce470",
  storageBucket: "datainsights-ce470.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX", // Replace with your actual sender ID
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX" // Replace with your actual app ID
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
