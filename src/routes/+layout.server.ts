//src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { jwtDecode } from 'jwt-decode';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    const accessToken = cookies.get('access_token');
    const refreshToken = cookies.get('refresh_token');

    console.log('🔑 Access Token:', accessToken);
    console.log('🔑 Refresh Token:', refreshToken);

    const isAuthenticated = !!(accessToken || refreshToken);
    let userRole: 'doctor' | 'patient' | 'admin' | null = null;

    if (accessToken) {
        try {
            const decodedToken = jwtDecode<{ role: 'doctor' | 'patient' | 'admin' }>(accessToken);
            userRole = decodedToken?.role ?? null;
        } catch (error) {
            console.error('Error al decodificar el JWT:', error);
        }
    }

    // 🛑 Si NO está autenticado, no se envía redirección (debe ver el login)
    if (!isAuthenticated) {
        return { isAuthenticated, userRole };
    }

    // ✅ Si ya está autenticado, revisamos si está en la página correcta
    const isOnCorrectPage = (role: string) => {
        if (role === 'doctor' && url.pathname.startsWith('/dashboard/doctor')) return true;
        if (role === 'patient' && url.pathname.startsWith('/dashboard/patient')) return true;
        if (role === 'admin' && url.pathname.startsWith('/admin')) return true;
        return false;
    };

    if (userRole && !isOnCorrectPage(userRole)) {
        return {
            isAuthenticated,
            userRole,
            redirect: `/dashboard/${userRole}` // Se enviará al frontend para redirigir
        };
    }

    return { isAuthenticated, userRole };
};
