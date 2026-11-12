import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import type { UserProfile, ThemeMode } from '../types';

/**
 * Creates or updates a user profile document in Firestore
 */
export async function syncUserProfile(user: User, additionalData: { fullName?: string; preferredTheme?: ThemeMode } = {}): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const now = new Date().toISOString();

  if (!userSnap.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      fullName: additionalData.fullName || user.displayName || 'Anonymous User',
      displayName: user.displayName || additionalData.fullName || 'User',
      email: user.email || '',
      photoURL: user.photoURL || null,
      provider: user.providerData[0]?.providerId || 'password',
      emailVerified: user.emailVerified,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      loginCount: 1,
      preferredTheme: additionalData.preferredTheme || 'dark',
      language: 'en',
      accountStatus: 'active',
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } else {
    const existing = userSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = {
      email: user.email || existing.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL || existing.photoURL,
      lastLoginAt: now,
      updatedAt: now,
      loginCount: (existing.loginCount || 1) + 1,
    };

    if (additionalData.fullName && !existing.fullName) {
      updates.fullName = additionalData.fullName;
    }

    await updateDoc(userRef, {
      ...updates,
      loginCount: increment(1),
    });

    return { ...existing, ...updates, loginCount: (existing.loginCount || 1) + 1 };
  }
}

/**
 * Retrieve user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Google Sign-In
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const result = await signInWithPopup(auth, googleProvider);
  const profile = await syncUserProfile(result.user);
  return { user: result.user, profile };
}

/**
 * Email & Password Registration
 */
export async function registerWithEmail(
  fullName: string,
  email: string,
  pass: string
): Promise<{ user: User; profile: UserProfile }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Set Firebase Auth display name
  await updateProfile(user, {
    displayName: fullName,
  });

  // Send real Firebase email verification
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: true,
    };
    await sendEmailVerification(user, actionCodeSettings);
  } catch (err) {
    console.warn('Could not send verification email automatically:', err);
  }

  // Create profile in Firestore
  const profile = await syncUserProfile(user, { fullName });
  return { user, profile };
}

/**
 * Email & Password Login
 */
export async function loginWithEmail(
  email: string,
  pass: string,
  rememberMe: boolean = true
): Promise<{ user: User; profile: UserProfile }> {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  const profile = await syncUserProfile(user);
  return { user, profile };
}

/**
 * Password Reset Email
 */
export async function sendResetPasswordEmail(email: string): Promise<void> {
  const actionCodeSettings = {
    url: `${window.location.origin}/reset-password`,
    handleCodeInApp: true,
  };
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
}

/**
 * Verify Password Reset Code
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
  return await verifyPasswordResetCode(auth, oobCode);
}

/**
 * Confirm Password Reset
 */
export async function confirmPasswordResetAction(oobCode: string, newPass: string): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPass);
}

/**
 * Verify Email using Action Code
 */
export async function applyEmailVerificationCode(oobCode: string): Promise<void> {
  await applyActionCode(auth, oobCode);
  if (auth.currentUser) {
    await auth.currentUser.reload();
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Resend Email Verification
 */
export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error('No user is currently signed in');
  const actionCodeSettings = {
    url: `${window.location.origin}/verify-email`,
    handleCodeInApp: true,
  };
  await sendEmailVerification(auth.currentUser, actionCodeSettings);
}

/**
 * Update Profile Details in Firestore and Auth
 */
export async function updateUserProfileData(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const now = new Date().toISOString();
  await updateDoc(userRef, {
    ...updates,
    updatedAt: now,
  });

  if (auth.currentUser) {
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (updates.displayName) authUpdates.displayName = updates.displayName;
    if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(auth.currentUser, authUpdates);
    }
  }
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

