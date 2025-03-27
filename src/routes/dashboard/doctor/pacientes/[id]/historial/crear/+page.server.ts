//src/routes/dashboard/doctor/pacientes/[id]/historial/crear/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {

    const accessToken = cookies.get('access_token');

    try {
        const patientId = params.id;
        
        return {
            patientId,
            accessToken
        };
    } catch (err) {
        console.error('Error loading patient ID:', err);
        throw error(500, "Error inesperado al cargar los datos");
    }
};