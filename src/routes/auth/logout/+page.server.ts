//src/routes/auth/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// ✨ Elimina las cookies
		cookies.delete('access_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });

		// 🚨 Redireccionar de regreso a la página de autenticación
		throw redirect(302, '/auth');
	}
};