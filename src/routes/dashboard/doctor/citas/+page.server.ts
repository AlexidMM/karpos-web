// src/routes/dashboard/doctor/citas/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }
        
        // Fetch appointments using the new view endpoint
        const appointmentsResponse = await fetch('http://localhost:3000/appointments/details/view', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!appointmentsResponse.ok) {
            if (appointmentsResponse.status === 401) {
                throw error(401, "Sesión expirada, inicia sesión nuevamente");
            }
            throw error(appointmentsResponse.status, `Error obteniendo citas: ${appointmentsResponse.statusText}`);
        }
        
        const responseData = await appointmentsResponse.json();
        
        // Transform the rows into an array of objects
        const citas = responseData.rows.map((row: any) => ({
            appointment_id: row[0],
            patient_name: row[1],
            doctor_name: row[2],
            appointment_date: row[3],
            appointment_time: row[4],
            appointment_status: row[5]
        }));
        
        return {
            citas
        };
    } catch (err) {
        console.error('Error fetching appointments:', err);
        throw error(500, "Error inesperado al cargar las citas");
    }
};