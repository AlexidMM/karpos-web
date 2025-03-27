// src/routes/dashboard/doctor/pacientes/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        const patientId = params.id;
        
        // Usamos el nuevo endpoint que combina paciente y datos médicos
        const response = await fetch(`http://localhost:3000/view-paciendatos/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw error(401, "Sesión expirada, inicia sesión nuevamente");
            }
            throw error(response.status, `Error obteniendo datos del paciente: ${response.statusText}`);
        }

        const patientData = await response.json();

        return {
            patient: patientData[0], // Asumimos que la respuesta es un array con un solo elemento
            hasError: false
        };
    } catch (err) {
        console.error('Error fetching data:', err);
        throw error(500, "Error inesperado al cargar los datos");
    }
};