import { signInWithPopup } from "firebase/auth";
import React, { useState, useEffect, useContext, createContext } from "react";
import {
  firebaseAuth,
  googleAuthProvider,
  createUserDocument,
} from "../config/firebaseConfig.js";

const authContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signout = () => {
    return firebaseAuth.signOut().then(() => {
      setUser(false);
    });
  };

  const signInWithGoogle = () => {
    return signInWithPopup(
      firebaseAuth,
      googleAuthProvider.setCustomParameters({
        prompt: "select_account",
      })
    );
  };

  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        createUserDocument(user);
      } else {
        setUser(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Return the user object and auth methods
  return {
    user,
    signout,
    signInWithGoogle,
  };
}
