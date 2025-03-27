<!-- src/routes/dashboard/doctor/citas/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    // Extraemos las citas de los datos cargados por el servidor
    let { citas } = data;
    
    // Función para determinar el color según el estado de la cita
    function getStatusColor(status: string) {
        switch(status.toLowerCase()) {
            case 'pending': return 'bg-yellow-200 text-yellow-800';
            case 'completed': return 'bg-green-200 text-green-800';
            case 'cancelled': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }
    
    // Función para formatear la fecha en formato local
    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES');
    }
</script>

<div>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Gestión de Citas</h2>
    </div>
    
    <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
            <thead>
                <tr>
                    <th class="py-3 px-4 bg-blue-100 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b">
                        ID
                    </th>
                    <th class="py-3 px-4 bg-blue-100 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b">
                        Paciente
                    </th>
                    <th class="py-3 px-4 bg-blue-100 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b">
                        Doctor
                    </th>
                    <th class="py-3 px-4 bg-blue-100 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b">
                        Fecha
                    </th>
                    <th class="py-3 px-4 bg-blue-100 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b">
                        Hora
                    </th>
                    <th class="py-3 px-4 bg-blue-100 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b">
                        Estado
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each citas as cita, i}
                    <tr class={i % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                        <td class="py-3 px-4 border-b border-gray-200">
                            {cita.appointment_id}
                        </td>
                        <td class="py-3 px-4 border-b border-gray-200 font-medium">
                            {cita.patient_name}
                        </td>
                        <td class="py-3 px-4 border-b border-gray-200">
                            {cita.doctor_name}
                        </td>
                        <td class="py-3 px-4 border-b border-gray-200">
                            {formatDate(cita.appointment_date)}
                        </td>
                        <td class="py-3 px-4 border-b border-gray-200">
                            {cita.appointment_time}
                        </td>
                        <td class="py-3 px-4 border-b border-gray-200">
                            <span class={`px-2 py-1 rounded-full text-xs ${getStatusColor(cita.appointment_status)}`}>
                                {cita.appointment_status}
                            </span>
                        </td>
                    </tr>
                {/each}
                
                {#if citas.length === 0}
                    <tr>
                        <td colspan="6" class="py-8 text-center text-gray-500">
                            No hay citas disponibles
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>