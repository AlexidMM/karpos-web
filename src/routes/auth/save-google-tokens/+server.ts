// src/routes/auth/save-google-tokens/+server.ts
import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { jwtDecode } from 'jwt-decode';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { accessToken, refreshToken } = await request.json();

    console.log("🟢 Guardando tokens de Google...");

    if (!accessToken || !refreshToken) {
        console.error("❌ Faltan tokens en la petición");
        return new Response('Tokens requeridos', { status: 400 });
    }

    try {
        const decodedToken = jwtDecode<{ exp: number, role: string }>(accessToken);

        if (!decodedToken || !decodedToken.exp || !decodedToken.role) {
            console.error("❌ El token no contiene datos válidos");
            return new Response('Token inválido', { status: 400 });
        }

        const expirationDate = new Date(decodedToken.exp * 1000);

        cookies.set('access_token', accessToken, {
            httpOnly: true,
            secure: true, 
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

        console.log("✅ Tokens guardados exitosamente en cookies");

        return redirect(302, '/auth/redirect');
    } catch (error) {
        console.error('❌ Error al procesar los tokens:', error);
        return new Response('Token inválido', { status: 400 });
    }
};

