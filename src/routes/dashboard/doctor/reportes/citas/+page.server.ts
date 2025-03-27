// src/routes/dashboard/doctor/reportes/citas/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }
        
        // Obtener lista de doctores
        const doctorsResponse = await fetch('http://localhost:3000/doctors', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!doctorsResponse.ok) {
            throw error(doctorsResponse.status, "Error al obtener doctores");
        }
        
        const doctors = await doctorsResponse.json();
        
        // Obtener lista de pacientes
        const patientsResponse = await fetch('http://localhost:3000/patients', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!patientsResponse.ok) {
            throw error(patientsResponse.status, "Error al obtener pacientes");
        }
        
        const patients = await patientsResponse.json();
        
        return {
            doctors,
            patients
        };
    } catch (err) {
        console.error('Error en la carga de datos:', err);
        throw error(500, "Error al cargar los datos necesarios");
    }
};