// src/routes/dashboard/doctor/pacientes/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface PatientData {
    id_pc: number;
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    age: number;
    weight: number;
    height: number;
    gender: string;
    blood_type: string;
    diagnosis: string;
    treatment: string;
    notes: string;
}

export const load: PageServerLoad = async ({ fetch, params, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        const patientId = params.id;
        console.log('🔄 Fetching patient data for ID:', patientId);
        
        // Usamos el endpoint que utiliza la vista paciendatos
        const response = await fetch(`http://localhost:3000/patients/datos/all`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            
            if (response.status === 401) {
                throw error(401, "Sesión expirada, inicia sesión nuevamente");
            }
            throw error(response.status, `Error obteniendo datos del paciente: ${errorText}`);
        }

        const allPatientsData = await response.json() as PatientData[];
        console.log('✅ All patients data received:', allPatientsData.length, 'records');
        
        // Filtramos para obtener solo los datos del paciente específico
        const patientData = allPatientsData.find((p: PatientData) => p.id_pc === Number(patientId));
        
        if (!patientData) {
            console.error('❌ Patient not found:', patientId);
            throw error(404, "Paciente no encontrado");
        }

        console.log('✅ Patient data found:', patientData);

        return {
            patient: patientData,
            hasError: false
        };
    } catch (err) {
        console.error('❌ Error loading data:', err);
        if (err instanceof Error) {
            throw error(500, `Error inesperado al cargar los datos: ${err.message}`);
        }
        throw error(500, "Error inesperado al cargar los datos");
    }
};