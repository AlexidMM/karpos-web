<!-- src/routes/dashboard/doctor/pacientes/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidate } from '$app/navigation';
    
    export let data; // Recibe los datos cargados por el servidor
    
    // Extrae los pacientes de los datos
    let patients = data.patients;
    
    // Variable para controlar el estado de carga
    let isLoading = false;
    // Variable para controlar el estado de error
    let error: string | null = null;
    let success: string | null = null;
    
    // Para manejar el formulario con enhance
    function handleDeleteSubmit() {
        return async ({ result }: any) => {
            if (result.type === 'success') {
                success = 'Paciente eliminado correctamente';
                // Actualiza la lista sin recargar la página
                await invalidate('app:patients');
            } else if (result.type === 'failure') {
                error = result.data?.message || 'Error al eliminar el paciente';
            }
        };
    }
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-blue-800">Lista de Pacientes</h2>
        <a href="/dashboard/doctor/pacientes/nuevo" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Registrar Nuevo Paciente
        </a>
    </div>
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{error}</span>
            <button class="absolute top-0 right-0 px-4 py-3" on:click={() => error = null}>
                <span class="sr-only">Cerrar</span>
                &times;
            </button>
        </div>
    {/if}
    
    {#if success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{success}</span>
            <button class="absolute top-0 right-0 px-4 py-3" on:click={() => success = null}>
                <span class="sr-only">Cerrar</span>
                &times;
            </button>
        </div>
    {/if}
    
    {#if isLoading}
        <div class="flex justify-center my-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if patients.length === 0}
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded-md text-center">
            <p class="text-lg">No hay pacientes registrados</p>
            <p class="text-sm mt-2">Utiliza el botón "Registrar Nuevo Paciente" para añadir uno</p>
        </div>
    {:else}
        <div class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Sangre</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each patients as patient}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">{patient.nombre} {patient.apellido_p} {patient.apellido_m}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{patient.age}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{patient.blood_type}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href={`/dashboard/doctor/pacientes/${patient.id_pc}`} class="text-blue-600 hover:text-blue-900 mr-3">Ver</a>
                                <a href={`/dashboard/doctor/pacientes/${patient.id_pc}/editar`} class="text-green-600 hover:text-green-900 mr-3">Editar</a>
                                
                                <!-- Usa un formulario para el manejo seguro de operaciones DELETE -->
                                <form method="POST" action="?/deletePatient" use:enhance={handleDeleteSubmit} class="inline">
                                    <input type="hidden" name="patientId" value={patient.id_pc} />
                                    <button 
                                        type="submit" 
                                        class="text-red-600 hover:text-red-900"
                                        on:click={() => confirm('¿Estás seguro de que deseas eliminar este paciente?')}
                                    >
                                        Eliminar
                                    </button>
                                </form>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>