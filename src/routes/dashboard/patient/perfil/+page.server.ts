// src/routes/dashboard/patient/perfil/+page.server.ts (solución final)
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, depends }: { fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>, cookies: any, depends: (dependency: string) => void }) => {
    // Crear una dependencia para este endpoint
    depends('app:patientProfile');
    
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
        
        // Paso 2: Obtener TODAS las citas (ya que el filtrado de la API no funciona correctamente)
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
        
        const allAppointments: { status: string, patient_id?: number, id_pc?: number, patientId?: number }[] = await appointmentsResponse.json();
        
        // IMPORTANTE: Filtramos manualmente por el id_pc o patient_id (probamos varias variantes)
        // Este paso es crucial ya que la API no está filtrando correctamente
        const filteredAppointments = allAppointments.filter(app => {
            // Intentamos todas las posibles variantes de nombre para el id del paciente
            return (
                app.id_pc === patientData.id_pc || 
                app.patient_id === patientData.id_pc || 
                app.patientId === patientData.id_pc
            );
        });
        
        // Contar citas por estado usando las citas filtradas
        const appointmentStats = {
            total: filteredAppointments.length,
            pending: filteredAppointments.filter(app => app.status === 'pending').length,
            completed: filteredAppointments.filter(app => app.status === 'completed').length,
            cancelled: filteredAppointments.filter(app => app.status === 'cancelled').length
        };

        // Paso 3: Retornar los datos al frontend
        return {
            patient: {
                nombre: patientData.nombre,
                apellido_p: patientData.apellido_p,
                apellido_m: patientData.apellido_m,
                age: patientData.age,
                weight: patientData.weight,
                height: patientData.height,
                gender: patientData.gender,
                blood_type: patientData.blood_type
            },
            appointmentStats
        };
    } catch (err) {
        console.error('Error loading patient data:', err);
        throw error(500, "Error inesperado al cargar los datos del paciente");
    }
};