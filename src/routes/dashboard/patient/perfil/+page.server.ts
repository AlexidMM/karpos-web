// src/routes/dashboard/patient/perfil/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Appointment {
    appointment_id: number;
    patient_name: string;
    doctor_name: string;
    appointment_date: string;
    appointment_time: string;
    appointment_status: string;
}

export const load: PageServerLoad = async ({ fetch, cookies, depends }) => {
    depends('app:patientProfile');
    
    try {
        const accessToken = cookies.get('access_token');
        const userId = cookies.get('id_us');
        
        if (!accessToken || !userId) {
            console.error('❌ Missing auth data:', { accessToken: !!accessToken, userId });
            throw error(401, "No estás autenticado o falta el ID del usuario");
        }

        // Paso 1: Obtener el paciente asociado al id_us
        const timestamp = new Date().getTime();
        const patientUrl = `http://10.224.0.3:3001/patients/by-user/${userId}?_t=${timestamp}`;
        
        const patientResponse = await fetch(patientUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!patientResponse.ok) {
            throw error(patientResponse.status, 'Error al obtener datos del paciente');
        }
        
        const patientData = await patientResponse.json();
        const patient = Array.isArray(patientData) ? patientData[0] : patientData;
        
        if (!patient) {
            throw error(404, "No se encontró el paciente");
        }
        
        // Paso 2: Obtener todas las citas
        const appointmentsUrl = `http://10.224.0.3:3001/patients/appointments/details?_t=${timestamp}`;
        
        const appointmentsResponse = await fetch(appointmentsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, 'Error al obtener las citas');
        }
        
        const allAppointments = await appointmentsResponse.json() as Appointment[];
        
        // Construimos el nombre completo del paciente para filtrar
        const patientFullName = `${patient.nombre} ${patient.apellido_p || ''} ${patient.apellido_m || ''}`.trim();
        
        // Filtramos las citas por el nombre exacto del paciente
        const patientAppointments = allAppointments.filter(app => app.patient_name === patientFullName);
        
        // Calculamos las estadísticas de las citas
        const appointmentStats = {
            total: patientAppointments.length,
            pending: patientAppointments.filter(app => app.appointment_status === 'pending').length,
            completed: patientAppointments.filter(app => app.appointment_status === 'completed').length,
            cancelled: patientAppointments.filter(app => app.appointment_status === 'cancelled').length
        };
        
        // Retornamos los datos necesarios para la interfaz
        return {
            patient: {
                nombre: patient.nombre,
                apellido_p: patient.apellido_p,
                apellido_m: patient.apellido_m,
                age: patient.age,
                weight: patient.weight,
                height: patient.height,
                gender: patient.gender,
                blood_type: patient.blood_type
            },
            appointmentStats
        };
    } catch (err) {
        console.error('❌ Error:', err);
        throw error(500, err instanceof Error ? err.message : "Error inesperado");
    }
};