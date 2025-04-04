//src/routes/dashboard/doctor/pacientes/nuevo/+page.server.ts
import { error, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, fetch, cookies }) => {
        const formData = await request.formData();
        
        // Extraer los datos del formulario
        const nombre = formData.get('nombre') as string;
        const apellido_p = formData.get('apellido_p') as string;
        const apellido_m = formData.get('apellido_m') as string || null;
        const edad = formData.get('edad') ? Number(formData.get('edad')) : null;
        const weight = formData.get('weight') ? Number(formData.get('weight')) : null;
        const height = formData.get('height') ? Number(formData.get('height')) : null;
        const gender = formData.get('gender') as string || null;
        const blood_type = formData.get('blood_type') as string || null;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        // Validación
        if (!nombre || !apellido_p || !email || !password) {
            return {
                success: false,
                error: 'Por favor completa los campos obligatorios'
            };
        }
        
        try {
            const accessToken = cookies.get('access_token');
            
            if (!accessToken) {
                throw error(401, "No estás autenticado");
            }
            
            const response = await fetch('http://34.51.19.104:3001/patients/with-user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: {
                        email,
                        password,
                        role: 'patient'
                    },
                    nombre,
                    apellido_p,
                    apellido_m,
                    edad,
                    weight,
                    height,
                    gender,
                    blood_type
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Error al crear el paciente'
                };
            }
            
            // Redirigir a la lista de pacientes
            throw redirect(303, '/dashboard/doctor/pacientes');
            
        } catch (err) {
            if (err instanceof Response) throw err;
            console.error('Error creating patient:', err);
            return {
                success: false,
                error: (err as Error).message
            };
        }
    }
};