// src/routes/dashboard/patient/home/+page.server.ts
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
    // Crear una dependencia para este endpoint
    depends('app:patientHome');
    
    try {
        const accessToken = cookies.get('access_token');
        const userId = cookies.get('id_us');
        
        if (!accessToken || !userId) {
            console.error('❌ Missing auth data:', { accessToken: !!accessToken, userId });
            throw error(401, "No estás autenticado o falta el ID del usuario");
        }

        console.log('🔍 Debug - Auth Info:', {
            hasAccessToken: !!accessToken,
            userId: userId
        });
        
        console.log('🔄 Fetching patient data for user:', userId);
        
        // Paso 1: Obtener el paciente asociado al id_us
        const timestamp = new Date().getTime();
        const patientUrl = `http://localhost:3000/patients/by-user/${userId}?_t=${timestamp}`;
        console.log('🔍 Debug - Patient API URL:', patientUrl);
        
        const patientResponse = await fetch(patientUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!patientResponse.ok) {
            const errorText = await patientResponse.text();
            console.error('❌ Patient API Error:', {
                status: patientResponse.status,
                statusText: patientResponse.statusText,
                body: errorText,
                url: patientUrl
            });
            throw error(patientResponse.status, `Error al obtener datos del paciente: ${errorText}`);
        }
        
        const patientData = await patientResponse.json();
        console.log('✅ Patient data received:', patientData);
        
        // Extract the first patient from the array
        const patient = Array.isArray(patientData) ? patientData[0] : patientData;
        console.log('🔍 Debug - Extracted patient:', patient);
        
        // Verificar que realmente tenemos un ID de paciente válido
        if (!patient?.id_pc) {
            console.error('❌ Invalid patient data:', patient);
            throw error(500, "Error: No se pudo determinar el ID del paciente");
        }
        
        console.log('🔍 Debug - Patient ID for filtering:', patient.id_pc);
        console.log('🔄 Fetching appointments for patient:', patient.id_pc);
        
        // Paso 2: Obtener las citas usando la vista
        const appointmentsUrl = `http://localhost:3000/patients/appointments/details?_t=${timestamp}`;
        console.log('🔍 Debug - Appointments API URL:', appointmentsUrl);
        
        const appointmentsResponse = await fetch(appointmentsUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!appointmentsResponse.ok) {
            const errorText = await appointmentsResponse.text();
            console.error('❌ Appointments API Error:', {
                status: appointmentsResponse.status,
                statusText: appointmentsResponse.statusText,
                body: errorText,
                url: appointmentsUrl
            });
            throw error(appointmentsResponse.status, `Error al obtener las citas: ${errorText}`);
        }
        
        const allAppointments = await appointmentsResponse.json() as Appointment[];
        console.log('✅ All appointments received:', allAppointments.length);
        console.log('🔍 Debug - Ejemplo de estructura de cita:', allAppointments.length > 0 ? allAppointments[0] : 'No hay citas');
        
        // Construimos el nombre completo del paciente y lo normalizamos
        const normalizeString = (str: string) => str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const patientFullName = `${patient.nombre} ${patient.apellido_p || ''} ${patient.apellido_m || ''}`.trim();
        const normalizedPatientName = normalizeString(patientFullName);
        console.log('🔍 Debug - Nombre completo del paciente:', {
            original: patientFullName,
            normalized: normalizedPatientName
        });
        
        // Filtramos las citas por nombre del paciente
        const patientAppointments = allAppointments.filter(app => {
            const normalizedAppointmentName = normalizeString(app.patient_name);
            const isMatch = normalizedAppointmentName === normalizedPatientName;
            console.log('🔍 Debug - Comparación de nombres:', {
                patientName: {
                    original: patientFullName,
                    normalized: normalizedPatientName
                },
                appointmentName: {
                    original: app.patient_name,
                    normalized: normalizedAppointmentName
                },
                isMatch
            });
            return isMatch;
        });
        
        console.log('✅ Filtered appointments for patient:', patientAppointments.length);
        console.log('🔍 Debug - Todas las citas filtradas:', patientAppointments);
        
        // Organizamos las citas por estado
        const pendingAppointments = patientAppointments.filter(app => app.appointment_status === 'pending');
        const completedAppointments = patientAppointments.filter(app => app.appointment_status === 'completed');
        
        return {
            patient: patient,
            appointments: {
                all: patientAppointments,
                pending: pendingAppointments,
                completed: completedAppointments
            }
        };
    } catch (err) {
        console.error('❌ Error loading patient home data:', {
            error: err,
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined
        });
        
        if (err instanceof Error) {
            throw error(500, `Error inesperado al cargar los datos del paciente: ${err.message}`);
        }
        throw error(500, "Error inesperado al cargar los datos del paciente");
    }
};