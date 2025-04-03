// src/routes/dashboard/doctor/citas/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface AppointmentData {
    appointment_id: number;
    patient_name: string;
    doctor_name: string;
    appointment_date: string;
    appointment_time: string;
    appointment_status: string;
}

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            console.error('❌ No access token found');
            throw error(401, "No estás autenticado");
        }
        
        console.log('🔄 Fetching appointments data...');
        
        // Fetch appointments using the new view endpoint
        const appointmentsResponse = await fetch('http://localhost:3000/patients/appointments/details', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!appointmentsResponse.ok) {
            const errorText = await appointmentsResponse.text();
            console.error('❌ API Error:', {
                status: appointmentsResponse.status,
                statusText: appointmentsResponse.statusText,
                body: errorText
            });
            
            if (appointmentsResponse.status === 401) {
                throw error(401, "Sesión expirada, inicia sesión nuevamente");
            }
            throw error(appointmentsResponse.status, `Error obteniendo citas: ${errorText}`);
        }
        
        const responseData = await appointmentsResponse.json();
        console.log('✅ Raw response data:', responseData);
        
        // Verificar si responseData es un array
        if (!Array.isArray(responseData)) {
            console.error('❌ Response data is not an array:', responseData);
            throw error(500, "Formato de respuesta inválido");
        }
        
        // Transform the data into an array of objects
        const citas = responseData.map((row: any) => ({
            appointment_id: row.appointment_id,
            patient_name: row.patient_name,
            doctor_name: row.doctor_name,
            appointment_date: row.appointment_date,
            appointment_time: row.appointment_time,
            appointment_status: row.appointment_status
        }));
        
        console.log('✅ Processed appointments:', citas.length);
        
        return {
            citas
        };
    } catch (err) {
        console.error('❌ Error loading appointments:', err);
        if (err instanceof Error) {
            throw error(500, `Error inesperado al cargar las citas: ${err.message}`);
        }
        throw error(500, "Error inesperado al cargar las citas");
    }
};