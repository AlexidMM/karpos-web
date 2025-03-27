<!-- frontend: src/routes/dashboard/doctor/reportes/citas/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    // Parámetros para el reporte
    let startDate = '';
    let endDate = '';
    let doctorId = 'all';
    let patientId = 'all';
    let status = 'all';
    
    // Lista de doctores y pacientes para los filtros
    $: doctors = data.doctors || [];
    $: patients = data.patients || [];
    
    // Función para generar el reporte
    async function generateReport() {
        try {
            // Construir URL con parámetros de consulta
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (doctorId !== 'all') params.append('doctorId', doctorId);
            if (patientId !== 'all') params.append('patientId', patientId);
            if (status !== 'all') params.append('status', status);

            // Realizar la solicitud para obtener el PDF
            const response = await fetch(`/dashboard/doctor/reportes/citas/generate?${params.toString()}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }

            // Obtener el blob y crear URL para abrir en una nueva pestaña
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Abrir el PDF en una nueva pestaña
            window.open(url, '_blank');

            // Liberar la URL del blob después de abrir el PDF
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert('Ocurrió un error al generar el reporte. Por favor, intenta nuevamente.');
        }
    }
</script>

<div class="min-h-screen bg-blue-50 p-6">
    <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6">Karpos</h1>
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Reporte de Citas</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Rango de fechas -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="startDate">
                    Fecha de inicio
                </label>
                <input 
                    type="date" 
                    id="startDate" 
                    bind:value={startDate}
                    class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="endDate">
                    Fecha de fin
                </label>
                <input 
                    type="date" 
                    id="endDate" 
                    bind:value={endDate}
                    class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
            </div>
            
            <!-- Filtro por doctor -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="doctorId">
                    Doctor
                </label>
                <select 
                    id="doctorId"
                    bind:value={doctorId}
                    class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                    <option value="all">Todos los doctores</option>
                    {#each doctors as doctor}
                        <option value={doctor.id_dc}>{doctor.nombre} {doctor.apellido_m} {doctor.apellido_p}</option>
                    {/each}
                </select>
            </div>
            
            <!-- Filtro por paciente -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="patientId">
                    Paciente
                </label>
                <select 
                    id="patientId"
                    bind:value={patientId}
                    class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                    <option value="all">Todos los pacientes</option>
                    {#each patients as patient}
                        <option value={patient.id_pc}>{patient.nombre} {patient.apellido_m} {patient.apellido_p} </option>
                    {/each}
                </select>
            </div>
            
            <!-- Filtro por estado -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="status">
                    Estado de la cita
                </label>
                <select 
                    id="status"
                    bind:value={status}
                    class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                </select>
            </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex justify-end space-x-3 mt-8">
            <button 
                class="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                on:click={() => history.back()}
            >
                Cancelar
            </button>
            <button 
                class="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                on:click={generateReport}
            >
                Generar Reporte
            </button>
        </div>
    </div>
</div>