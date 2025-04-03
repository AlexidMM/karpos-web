// src/routes/dashboard/doctor/reportes/+page.server.ts
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
            throw error(patientsResponse.status, "Error al obtener la lista de pacientes");
        }
        
        const patients = await patientsResponse.json();
        
        // Fetch appointments for all patients
        const appointmentsResponse = await fetch('http://localhost:3000/appointments', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, "Error al obtener las citas");
        }
        
        const appointments = await appointmentsResponse.json();
        
        // Fetch IoT data and map it to appointments
        const iotResponse = await fetch('http://localhost:3000/iot', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!iotResponse.ok) {
            throw error(iotResponse.status, "Error al obtener los datos IoT");
        }
        
        const iotData = await iotResponse.json();
        
        // Map IoT data to appointments using the 'cita' field
        const appointmentsWithIoT = appointments.map((appointment: any) => {
            const matchingIoT = iotData.find((iot: any) => iot.cita === appointment.id_ap.toString());
            return {
                ...appointment,
                iotData: matchingIoT || null
            };
        });
        
        return {
            doctors,
            patients,
            appointments: appointmentsWithIoT,
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

// Add type definitions
declare global {
    interface PageData {
        patients: any[];
        appointments: Array<{
            id_ap: string;
            iotData: {
                pulso: number[];
                fuerza: number[];
                fecha: string;
                cita: string;
                deviceId: string;
                metadata: {
                    receivedAt: string;
                    app: string;
                    pulsoCount: number;
                    fuerzaCount: number;
                };
                timestamp: string;
                createdAt: string;
                updatedAt: string;
            } | null;
            [key: string]: any;
        }>;
        iotData: any[];
        params: {
            startDate: string;
            endDate: string;
            patientId: string;
        };
    }
}