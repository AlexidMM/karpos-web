<!-- src/routes/dashboard/doctor/reportes/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    
    // Recibir datos del servidor
    export let data: PageData;
    
    // Extraer doctores y pacientes de los datos cargados por el servidor
    $: doctors = data.doctors || [];
    $: patients = data.patients || [];
    
    // Estado para controlar qué pestaña de reporte está activa
    let activeReportTab = 'paciente';
    
    // Datos para los filtros
    let startDate = '';
    let endDate = '';
    let doctorId = 'all';
    let patientId = 'all';
    let status = 'all';
    
    // Función para cambiar de pestaña de reporte
    function setReportTab(tab: string) {
        activeReportTab = tab;
    }
    
    // Función para generar el reporte
    async function generateReport() {
        try {
            // Construir URL con parámetros de consulta según el tipo de reporte
            const params = new URLSearchParams();
            
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            let endpoint = '';
            
            if (activeReportTab === 'paciente') {
                if (patientId !== 'all') params.append('patientId', patientId);
                endpoint = '/dashboard/doctor/reportes/pacientes/generate';
            } else if (activeReportTab === 'cita') {
                if (doctorId !== 'all') params.append('doctorId', doctorId);
                if (patientId !== 'all') params.append('patientId', patientId);
                if (status !== 'all') params.append('status', status);
                endpoint = '/dashboard/doctor/reportes/citas/generate';
            } else if (activeReportTab === 'general') {
                if (doctorId !== 'all') params.append('doctorId', doctorId);
                endpoint = '/dashboard/doctor/reportes/general/generate';
            }
            
            // Realizar la solicitud para obtener el PDF
            const response = await fetch(`${endpoint}?${params.toString()}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            
            // Obtener el blob y crear URL para descargar
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-${activeReportTab}-${new Date().toISOString().split('T')[0]}.pdf`;
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
    <!-- Contenido principal de Reportes -->
    <main class="bg-white rounded-lg shadow-md p-6">
        <div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Generación de Reportes</h2>
            
            <!-- Subtabs de Reportes -->
            <div class="border rounded-lg mb-4">
                <div class="flex border-b">
                    <button 
                        class="px-6 py-3 font-medium {activeReportTab === 'paciente' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-blue-50'}"
                        on:click={() => setReportTab('paciente')}
                    >
                        IoT
                    </button>
                    <button 
                        class="px-6 py-3 font-medium {activeReportTab === 'cita' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-blue-50'}"
                        on:click={() => setReportTab('cita')}
                    >
                        Cita
                    </button>
                    <button 
                        class="px-6 py-3 font-medium {activeReportTab === 'historial' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-blue-50'}"
                        on:click={() => setReportTab('historial')}
                    >
                        Historial Médico
                    </button>
                    <button 
                        class="px-6 py-3 font-medium {activeReportTab === 'general' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-blue-50'}"
                        on:click={() => setReportTab('general')}
                    >
                        General
                    </button>
                </div>
                
                <!-- Contenido de las subtabs -->
                <div class="p-4">
                    <!-- Filtros comunes para todos los reportes -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    </div>
                    
                    {#if activeReportTab === 'paciente'}
                        <div>
                            <h3 class="text-lg font-medium text-gray-700 mb-3">Reporte por Paciente</h3>
                            <p class="text-gray-600 mb-3">Este reporte muestra estadísticas e historial de un paciente específico.</p>
                            
                            <div class="mb-4">
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
                                        <option value={patient.id_pc}>{patient.nombre} {patient.apellido_p || ''} {patient.apellido_m || ''}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    {:else if activeReportTab === 'cita'}
                        <div>
                            <h3 class="text-lg font-medium text-gray-700 mb-3">Reporte de Citas</h3>
                            <p class="text-gray-600 mb-3">Este reporte muestra un listado de citas según los filtros seleccionados.</p>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            <option value={doctor.id_dc}>{doctor.nombre} {doctor.apellido_p || ''} {doctor.apellido_m || ''}</option>
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
                                            <option value={patient.id_pc}>{patient.nombre} {patient.apellido_p || ''} {patient.apellido_m || ''}</option>
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
                        </div>
                    {:else if activeReportTab === 'general'}
                        <div>
                            <h3 class="text-lg font-medium text-gray-700 mb-3">Reporte General</h3>
                            <p class="text-gray-600 mb-3">Este reporte muestra estadísticas generales de la clínica.</p>
                            
                            <!-- Filtro por doctor para estadísticas generales -->
                            <div class="mb-4 max-w-md">
                                <label class="block text-sm font-medium text-gray-700 mb-2" for="doctorId">
                                    Doctor (opcional)
                                </label>
                                <select 
                                    id="doctorId"
                                    bind:value={doctorId}
                                    class="w-full p-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
                                >
                                    <option value="all">Todos los doctores</option>
                                    {#each doctors as doctor}
                                        <option value={doctor.id_dc}>{doctor.nombre} {doctor.apellido_p || ''} {doctor.apellido_m || ''}</option>
                                    {/each}
                                </select>
                            </div>
                            
                            <div class="text-sm text-gray-500">
                                <p>Este reporte incluirá:</p>
                                <ul class="list-disc pl-5 mt-2">
                                    <li>Total de citas en el período seleccionado</li>
                                    <li>Distribución por estado de citas</li>
                                    <li>Ingresos generados</li>
                                    <li>Estadísticas por doctor (si se selecciona "Todos los doctores")</li>
                                    <li>Tendencias a lo largo del tiempo</li>
                                </ul>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 mt-4">
                <button class="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">
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
    </main>
</div>