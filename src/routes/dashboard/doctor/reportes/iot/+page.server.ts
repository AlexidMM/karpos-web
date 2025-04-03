import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        // Obtener lista de pacientes
        const patientsResponse = await fetch('http://localhost:3000/patients');
        if (!patientsResponse.ok) {
            throw new Error('Error al obtener pacientes');
        }
        const patients = await patientsResponse.json();

        return {
            patients
        };
    } catch (error) {
        console.error('Error en la carga de datos:', error);
        return {
            patients: []
        };
    }
}; 