import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, depends }: { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>, cookies: any, depends: (dependency: string) => void }) => {
    // Crear una dependencia para este endpoint
    depends('app:patientHome');
    
    try {
        const accessToken = cookies.get('access_token');
        const userId = cookies.get('id_us');
        
        if (!accessToken || !userId) {
            throw error(401, "No estás autenticado o falta el ID del usuario");
        }
        
        // Agregar timestamp para evitar caché
        const timestamp = new Date().getTime();
        
        // Paso 1: Obtener el paciente asociado al id_us
        const patientResponse = await fetch(`http://localhost:3000/patients/by-user/${userId}?_t=${timestamp}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!patientResponse.ok) {
            throw error(patientResponse.status, "Error al obtener datos del paciente");
        }
        
        const patientData = await patientResponse.json();
        
        // Verificar que realmente tenemos un ID de paciente válido
        if (!patientData.id_pc) {
            console.error("ID del paciente no encontrado en los datos de respuesta");
            throw error(500, "Error: No se pudo determinar el ID del paciente");
        }
        
        // Paso 2: Obtener TODAS las citas
        const appointmentsResponse = await fetch(`http://localhost:3000/appointments?_t=${timestamp}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, "Error al obtener las citas del paciente");
        }
        
        const allAppointments: { id_pc?: string; patient_id?: string; patientId?: string; status?: string }[] = await appointmentsResponse.json();
        
        // Filtramos manualmente por el id_pc o patient_id (probamos varias variantes)
        const patientAppointments = allAppointments.filter(app => {
            return (
                app.id_pc === patientData.id_pc || 
                app.patient_id === patientData.id_pc || 
                app.patientId === patientData.id_pc
            );
        });
        
        // Organizamos las citas por estado
        const pendingAppointments = patientAppointments.filter(app => app.status === 'pending');
        const completedAppointments = patientAppointments.filter(app => app.status === 'completed');
        
        return {
            patient: patientData,
            appointments: {
                all: patientAppointments,
                pending: pendingAppointments,
                completed: completedAppointments
            }
        };
    } catch (err) {
        console.error('Error loading patient home data:', err);
        throw error(500, "Error inesperado al cargar los datos del paciente");
    }
};