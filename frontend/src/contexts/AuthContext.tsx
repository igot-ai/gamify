'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// Note: Firebase is not used for frontend auth - we use backend API authentication
import type { User } from '../types/user';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session token
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Mock user for testing - in production, validate token with backend
            setUser({
                uid: 'test-user-id',
                email: 'test@sunstudio.com',
                displayName: 'Test User',
                photoURL: null,
                role: 'admin'
            });
        }
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        // Mock login - in production, call backend API for authentication
        if (email === 'test@sunstudio.com' && password === 'testpassword123') {
            setUser({
                uid: 'test-user-id',
                email: email,
                displayName: 'Test User',
                photoURL: null,
                role: 'admin'
            });
            localStorage.setItem('auth_token', 'mock-token-for-testing');
            return;
        }
        throw new Error('Invalid credentials');
    };

    const signInWithGoogle = async () => {
        // Google sign-in not implemented - use backend API authentication
        throw new Error('Google sign-in not available');
    };

    const logout = async () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
