import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { jwtDecode } from 'jwt-decode';

export const load: PageServerLoad = async ({ cookies }) => {
    const accessToken = cookies.get('access_token');
    
    if (!accessToken) {
        console.log('⚠️ No hay token, redirigiendo al login');
        return redirect(302, '/auth');
    }

    try {
        const decodedToken = jwtDecode<{ role: 'doctor' | 'patient' | 'admin' }>(accessToken);
        
        if (!decodedToken?.role) {
            console.log("⚠️ El token no contiene un rol válido");
            cookies.delete('access_token', { path: '/' });
            return redirect(302, '/auth');
        }

        console.log('🔄 Redirigiendo a:', `/dashboard/${decodedToken.role}`);
        return redirect(302, `/dashboard/${decodedToken.role}`);
    } catch (error) {
        console.error('❌ Error al decodificar el token:', error);
        cookies.delete('access_token', { path: '/' });
        return redirect(302, '/auth');
    }
};
