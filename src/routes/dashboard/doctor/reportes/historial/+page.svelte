<!-- src/routes/dashboard/doctor/reportes/historial/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    let selectedPatientId = '';
    let startDate = '';
    let endDate = '';
    
    async function generateReport() {
        if (!selectedPatientId) {
            alert('Por favor selecciona un paciente');
            return;
        }
        
        const params = new URLSearchParams();
        params.append('patientId', selectedPatientId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        try {
            const response = await fetch(`/dashboard/doctor/reportes/historial/generate?${params.toString()}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historial-medico-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert('Ocurrió un error al generar el reporte. Por favor, intenta nuevamente.');
        }
    }
</script>

<div class="min-h-screen bg-blue-50">
    <main class="bg-white rounded-lg shadow-md p-6">
        <div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Generar Historial Médico</h2>
            
            <div class="space-y-6">
                <!-- Selección de paciente -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2" for="patientId">
                        Seleccionar Paciente
                    </label>
                    <select 
                        id="patientId"
                        bind:value={selectedPatientId}
                        class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                    >
                        <option value="">Selecciona un paciente</option>
                        {#each data.patients as patient}
                            <option value={patient.id_pc}>
                                {patient.nombre} {patient.apellido_p || ''} {patient.apellido_m || ''}
                            </option>
                        {/each}
                    </select>
                </div>
                
                <!-- Filtros de fecha -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2" for="startDate">
                            Fecha de inicio (opcional)
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
                            Fecha de fin (opcional)
                        </label>
                        <input 
                            type="date" 
                            id="endDate" 
                            bind:value={endDate}
                            class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>
                
                <!-- Información del reporte -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-lg font-medium text-gray-700 mb-2">Contenido del Reporte</h3>
                    <ul class="list-disc pl-5 text-gray-600">
                        <li>Información personal del paciente</li>
                        <li>Historial completo de citas</li>
                        <li>Gráfico de progreso de citas</li>
                        <li>Datos de IoT por cita (si están disponibles)</li>
                        <li>Estadísticas de salud</li>
                    </ul>
                </div>
                
                <!-- Botones de acción -->
                <div class="flex justify-end space-x-3">
                    <button 
                        class="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                        on:click={generateReport}
                    >
                        Generar Reporte
                    </button>
                </div>
            </div>
        </div>
    </main>
</div> 