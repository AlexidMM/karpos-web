// src/routes/dashboard/doctor/pacientes/+page.server.ts
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';


export const load: PageServerLoad = async ({ fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }
        
        const response = await fetch('http://10.224.0.3:3001/patients', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Si el token expiró, podríamos intentar refrescar aquí
                throw error(401, "Sesión expirada, inicia sesión nuevamente");
            }
            throw error(response.status, `Error obteniendo pacientes: ${response.statusText}`);
        }
        
        const patients = await response.json();
        
        return {
            patients
        };
    } catch (err) {
        console.error('Error fetching patients:', err);
        throw error(500, "Error inesperado al cargar los pacientes");
    }
};

export const actions = {
    deletePatient: async ({ request, cookies, fetch }) => {
        const formData = await request.formData();
        const patientId = formData.get('patientId');
        
        if (!patientId) {
            return localFail(400, { message: 'ID de paciente no proporcionado' });
        }
        
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            return localFail(401, { message: 'No estás autenticado' });
        }
        
        try {
            const response = await fetch(`http://10.224.0.3:3001/patients/${patientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return localFail(response.status, { 
                    message: errorData.message || `Error ${response.status}: ${response.statusText}` 
                });
            }
            
            return { success: true };
        } catch (err) {
            console.error('Error al eliminar paciente:', err);
            return fail(500, { message: 'Error al procesar la solicitud' });
        }
    }
};

function localFail(arg0: number, arg1: { message: string; }) {
    throw new Error('Function not implemented.');
}
