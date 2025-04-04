import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        // Fetch patients list
        const patientsResponse = await fetch('http://10.224.0.3:3001/patients', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!patientsResponse.ok) {
            throw error(patientsResponse.status, "Error al obtener la lista de pacientes");
        }

        const patients = await patientsResponse.json();

        // Fetch appointments for all patients
        const appointmentsResponse = await fetch('http://10.224.0.3:3001/appointments', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, "Error al obtener las citas");
        }

        const appointments = await appointmentsResponse.json();

        // Fetch IoT data for all appointments
        const iotResponse = await fetch('http://10.224.0.3:3001/iot', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!iotResponse.ok) {
            throw error(iotResponse.status, "Error al obtener los datos IoT");
        }

        const iotData = await iotResponse.json();

        return {
            patients,
            appointments,
            iotData,
            params: {
                startDate: '',
                endDate: '',
                patientId: ''
            }
        };
    } catch (err) {
        console.error('Error loading data:', err);
        throw error(500, "Error al cargar los datos necesarios");
    }
}; 