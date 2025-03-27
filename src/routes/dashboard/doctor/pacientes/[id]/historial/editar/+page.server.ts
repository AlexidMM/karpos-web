//src/routes/dashboard/doctor/pacientes/[id]/historial/editar/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Interfaz para definir la estructura del historial médico
interface MedicalRecord {
    id_mr: number;
    id_pc: number;
    diagnosis: string;
    treatment: string;
    notes?: string;
}

export const load: PageServerLoad = async ({ fetch, params, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        const patientId = params.id;
        
        // Obtener historial médico para este paciente
        const medicalRecordsResponse = await fetch(`http://localhost:3000/medical-records`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!medicalRecordsResponse.ok) {
            throw error(medicalRecordsResponse.status, "Error al obtener historial médico");
        }

        const allMedicalRecords = await medicalRecordsResponse.json() as MedicalRecord[];
        
        // Filtramos para obtener el historial médico del paciente actual
        const medicalRecord: MedicalRecord | undefined = allMedicalRecords.find(record => record.id_pc === Number(patientId));
        
        if (!medicalRecord) {
            throw error(404, "No se encontró el historial médico para este paciente");
        }

        return {
            patientId,
            medicalRecordId: medicalRecord.id_mr,
            medicalRecord, // Añadimos el registro médico completo
            accessToken
        };
    } catch (err) {
        console.error('Error loading data:', err);
        throw error(500, "Error inesperado al cargar los datos");
    }
};