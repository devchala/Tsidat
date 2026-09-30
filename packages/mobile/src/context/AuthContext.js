import React, { createContext, useReducer, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const initialAuthState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  userRole: null, // 'citizen' | 'worker' | null
};

function authReducer(prevState, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        userToken: action.token,
        userRole: action.role,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
        userRole: action.role,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        userRole: null,
      };
    default:
      return prevState;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;
      let userRole = null;

      try {
        userToken = await AsyncStorage.getItem('userToken');
        userRole = await AsyncStorage.getItem('userRole');
      } catch (e) {
        console.error('Failed to restore session token', e);
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken, role: userRole });
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async ({ token, role }) => {
        try {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userRole', role);
          dispatch({ type: 'SIGN_IN', token, role });
        } catch (e) {
          console.error('Failed to save session token', e);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          dispatch({ type: 'SIGN_OUT' });
        } catch (e) {
          console.error('Failed to clear session storage', e);
        }
      },
      authState: state,
    }),
    [state]
  );

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}
