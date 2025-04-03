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
        
        // Obtener todas las citas
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
        
        // Calcular estadísticas generales
        const totalAppointments = appointments.length;
        const statusCounts = {
            completed: appointments.filter((app: any) => app.status === 'completed').length,
            pending: appointments.filter((app: any) => app.status === 'pending').length,
            cancelled: appointments.filter((app: any) => app.status === 'cancelled').length
        };
        
        // Calcular estadísticas por doctor
        const doctorStats = doctors.map(doctor => {
            const doctorAppointments = appointments.filter((app: any) => 
                app.doctor_id.toString() === doctor.id_dc.toString()
            );
            return {
                ...doctor,
                appointmentCount: doctorAppointments.length,
                completedCount: doctorAppointments.filter((app: any) => app.status === 'completed').length,
                pendingCount: doctorAppointments.filter((app: any) => app.status === 'pending').length,
                cancelledCount: doctorAppointments.filter((app: any) => app.status === 'cancelled').length
            };
        });
        
        return {
            doctors,
            appointments,
            stats: {
                totalAppointments,
                statusCounts,
                doctorStats
            },
            params: {
                startDate: '',
                endDate: '',
                doctorId: 'all'
            }
        };
    } catch (err) {
        console.error('Error loading data:', err);
        throw error(500, "Error al cargar los datos necesarios");
    }
}; 