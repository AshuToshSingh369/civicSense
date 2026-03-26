import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token?: string; // Optional legacy support
    homeDepartment?: string;
    departmentCode?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(async () => {
        try {
            // Call backend to clear httpOnly cookie
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Logout failed', error);
        }
        setUser(null);
        localStorage.removeItem('user');
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
