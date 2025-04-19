import { auth, db, googleProvider } from './config.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

// Sign in with Email & Password
export const signIn = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Sign-in successful. UID:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error('Sign-in error:', error.code, error.message);
        throw new Error(error.message);
    }
};

// Register with Email & Password
export const register = async (name, email, password) => {
    try {
        console.log('Attempting registration for email:', email);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        console.log('User created with UID:', user.uid);

        // Wait briefly to ensure authentication state is updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify current authentication state
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('No authenticated user found after registration');
        }
        console.log('Current authenticated user UID:', currentUser.uid);

        // Add user info to Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            name,
            email,
            uid: user.uid,
            photoURL: user.photoURL || null,
            createdAt: new Date()
        });
        console.log('User data successfully written to Firestore for UID:', user.uid);

        return user;
    } catch (error) {
        console.error('Registration error:', error.code, error.message);
        throw new Error(error.message);
    }
};

// export const register = async (name, email, password) => {
//     try {
//         console.log('Attempting registration for email:', email);
//         const result = await createUserWithEmailAndPassword(auth, email, password);
//         console.log('User credential result:', result);
//         const user = result.user;
//         if (!user) {
//             throw new Error('User object is null or undefined after registration');
//         }
//         console.log('User created with UID:', user.uid);
//         alert('User created with UID:', user.uid);

//         // Ensure authentication state is updated
//         await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay
//         const currentUser = auth.currentUser;
//         console.log('Current authenticated user:', currentUser ? currentUser.uid : 'null');

//         if (!currentUser) {
//             throw new Error('Authentication state not updated after registration');
//         }

//         // Write to Firestore with detailed error handling
//         const userRef = doc(db, 'users', user.uid);
//         console.log('Attempting to write to Firestore at:', userRef.path);
//         try {
//             await setDoc(userRef, {
//                 name,
//                 email,
//                 uid: user.uid,
//                 photoURL: user.photoURL || null,
//                 createdAt: new Date()
//             });
//             console.log('User data successfully written to Firestore for UID:', user.uid);
//         } catch (writeError) {
//             console.error('Firestore write error:', writeError.code, writeError.message);
//             throw new Error('Failed to write user data: ' + writeError.message);
//         }

//         return user;
//     } catch (error) {
//         console.error('Registration error:', error.code, error.message);
//         throw new Error(error.message);
//     }
// };
// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('Google sign-in successful. UID:', user.uid);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                name: user.displayName || 'Google User',
                email: user.email,
                uid: user.uid,
                photoURL: user.photoURL || null,
                createdAt: new Date()
            });
            console.log('New Google user data written to Firestore for UID:', user.uid);
        } else {
            console.log('Existing Google user found for UID:', user.uid);
        }

        return user;
    } catch (error) {
        console.error('Google sign-in error:', error.code, error.message);
        throw new Error(error.message);
    }
};