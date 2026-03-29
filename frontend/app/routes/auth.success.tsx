import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        const dataParam = searchParams.get('data');

        if (dataParam) {
            try {
                hasProcessed.current = true;
                
                const decodedStr = atob(dataParam);
                const userData = JSON.parse(decodedStr);

                
                login(userData);

                
                const needsProfileCompletion = !userData.homeDepartment || !userData.departmentCode;
                const isAuthority = userData.role === 'authority' || userData.role === 'admin';

                let redirectPath = isAuthority ? '/authority-dashboard' : '/dashboard';

                if (needsProfileCompletion && !isAuthority) {
                    redirectPath = '/auth/complete-profile';
                }

                navigate(redirectPath, { replace: true });
            } catch (error) {
                console.error("Failed to parse auth data", error);
                navigate('/login?error=InvalidAuthData', { replace: true });
            }
        } else {
            navigate('/login?error=MissingAuthData', { replace: true });
        }
    }, [searchParams, navigate, login]);


    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-blue-900 font-bold text-xl">Authenticating...</h2>
            </div>
        </div>
    );
}
