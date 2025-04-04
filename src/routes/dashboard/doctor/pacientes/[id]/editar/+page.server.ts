// src/routes/dashboard/doctor/pacientes/[id]/editar/+page.server.ts
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, cookies }) {
    const accessToken = cookies.get('access_token');

    if (!accessToken) {
        throw error(401, "No estás autenticado");
    }

    console.log("ID del paciente a cargar:", params.id);

    // Obtener paciente desde la API
    const response = await fetch(`http://34.51.19.104:3001/patients/${params.id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error("Error en la respuesta de la API:", response.status);
        throw error(response.status, 'No se pudo obtener la información del paciente.');
    }

    const patient = await response.json();
    console.log("Datos del paciente recibidos del backend:", patient);

    return { patient };
}

export const actions = {
    update: async ({ request, params, cookies }) => {
        const accessToken = cookies.get('access_token');

        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        const formData = await request.formData();
        const id = params.id;
        
        console.log("ID del paciente a actualizar:", id);
        
        const data = {
            nombre: formData.get('nombre'),
            apellido_p: formData.get('apellido_p'),
            apellido_m: formData.get('apellido_m'),
            age: Number(formData.get('edad')),
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
            gender: formData.get('gender'),
            blood_type: formData.get('blood_type')
        };
        
        console.log("Datos a enviar a la API:", data);

        try {
            const response = await fetch(`http://34.51.19.104:3001/patients/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error al actualizar paciente:", errorData);
                return {
                    status: response.status,
                    body: { message: errorData.message || 'Error al actualizar el paciente' }
                };
            }

            return {
                status: 200,
                body: { message: 'Paciente actualizado correctamente' }
            };
        } catch (err) {
            console.error("Error en la solicitud:", err);
            return {
                status: 500,
                body: { message: 'Error de conexión con el servidor' }
            };
        }
    }
};