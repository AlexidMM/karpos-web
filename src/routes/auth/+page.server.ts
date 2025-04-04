//src/routes/auth/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { jwtDecode } from 'jwt-decode';

const URI = 'http://34.51.19.104:3001/auth/login';

export const load: PageServerLoad = async ({ cookies }) => {
    const accessToken = cookies.get('access_token');
    if (accessToken) {
        const decodedToken = jwtDecode<{ role: string }>(accessToken);
        console.log("👀 Usuario ya autenticado:", decodedToken);
        
        if (!decodedToken?.role) {
            console.log("⚠️ El token no contiene un rol válido");
            cookies.delete('access_token', { path: '/' });
            return {};
        }
        
        // Verificar si ya estamos en la página de destino
        const currentPath = new URL('http://34.51.19.104:3001/').pathname;
        if (decodedToken.role === 'doctor' && !currentPath.startsWith('/dashboard/doctor')) {
            return redirect(302, '/dashboard/doctor');
        } else if (decodedToken.role === 'patient' && !currentPath.startsWith('/dashboard/patient')) {
            return redirect(302, '/dashboard/patient');
        }
    }
    return {};
};



export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            const res = await fetch(URI, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-type': 'application/json' }
            });
            
            if (!res.ok) {
                console.error('Error en la autenticación:', res.statusText);
                return { error: 'Credenciales incorrectas o error en el servidor' };
            }
            
            const json = await res.json();
            const { accessToken, refreshToken, userId } = json;
            
            if (!accessToken || !refreshToken) {
                console.error('El servidor no envió tokens válidos');
                return { error: 'Error en la autenticación, intenta de nuevo' };
            }
            
            const decodedToken = jwtDecode<{ exp: number, role: string }>(accessToken);
            
            if (!decodedToken || !decodedToken.exp) {
                console.error('El token no tiene una expiración válida');
                return { error: 'Token inválido, intenta de nuevo' };
            }
            
            const expirationDate = new Date(decodedToken.exp * 1000);
            
            cookies.set('access_token', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                expires: expirationDate,
                path: '/'
            });
            
            cookies.set('refresh_token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                expires: expirationDate,
                path: '/'
            });

            cookies.set('id_us', userId, {
                httpOnly: false,
                secure: false,
                sameSite: 'strict',
                expires: expirationDate,
                path: '/'
            });
            
            console.log('✅ Token guardado, usuario autenticado:', decodedToken);
            
            // Enviar a la página de redirección
            return redirect(302, '/auth/redirect');
        } catch (error) {
            console.error('Error en la solicitud:', error);
            return { error: 'Error inesperado, intenta de nuevo' };
        }
    }
};
