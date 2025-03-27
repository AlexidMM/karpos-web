<!-- src/routes/dashboard/patient/perfil/+page.svelte (versión final) -->
<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import Chart from 'chart.js/auto';
    
    export let data: {
        patient: {
            nombre: string;
            apellido_p: string;
            apellido_m: string;
            age: number;
            weight: number;
            height: number;
            gender: string;
            blood_type: string;
        };
        appointmentStats: {
            total: number;
            pending: number;
            completed: number;
            cancelled: number;
        }
    };
    
    // Variables reactivas
    $: nombrePaciente = `${data.patient.nombre} ${data.patient.apellido_p} ${data.patient.apellido_m}`;
    $: informacionPaciente = data.patient;
    $: appointmentStats = data.appointmentStats;
    
    let chartCanvas: HTMLCanvasElement | null = null;
    let pieChart: Chart | null = null;
    
    // Función para crear o actualizar la gráfica
    function createOrUpdateChart() {
        // Primero destruir la gráfica existente si hay una
        if (pieChart) {
            pieChart.destroy();
            pieChart = null;
        }
        
        // Solo crear la gráfica si hay citas y el canvas está disponible
        if (appointmentStats.total > 0 && chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                pieChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Pendientes', 'Completadas', 'Canceladas'],
                        datasets: [{
                            data: [
                                appointmentStats.pending, 
                                appointmentStats.completed, 
                                appointmentStats.cancelled
                            ],
                            backgroundColor: [
                                '#FFC107', // Amarillo para pendientes
                                '#4CAF50', // Verde para completadas
                                '#F44336'  // Rojo para canceladas
                            ],
                            borderColor: [
                                '#FFD54F',
                                '#81C784',
                                '#E57373'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                            title: {
                                display: true,
                                text: 'Estado de Citas',
                                font: {
                                    size: 16
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const percentage = Math.round((Number(value) / Number(appointmentStats.total)) * 100);
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }
    
    onMount(() => {
        createOrUpdateChart();
    });
    
    afterUpdate(() => {
        createOrUpdateChart();
    });
    
    onDestroy(() => {
        if (pieChart) {
            pieChart.destroy();
        }
    });
</script>

<div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
    <div class="flex justify-between items-center mb-4 bg-blue-100 p-3 rounded-t-lg border-b border-blue-300">
        <h2 class="text-xl font-semibold">📋 Perfil</h2>
        <div class="flex space-x-4">
            <span>{nombrePaciente}</span>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gráfica de progreso del paciente o mensaje si no hay citas -->
        <div class="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
            <h3 class="font-medium text-lg mb-3 text-blue-700 text-center">Distribución de Citas</h3>
            
            {#if appointmentStats.total > 0}
                <div class="flex items-center justify-center h-64">
                    <canvas bind:this={chartCanvas}></canvas>
                </div>
                <div class="mt-4 text-center text-sm text-gray-600">
                    <p>Total de citas: {appointmentStats.total}</p>
                    <div class="grid grid-cols-3 gap-2 mt-2">
                        <div class="flex flex-col items-center">
                            <span class="font-semibold" style="color: #FFC107">Pendientes</span>
                            <span>{appointmentStats.pending}</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span class="font-semibold" style="color: #4CAF50">Completadas</span>
                            <span>{appointmentStats.completed}</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span class="font-semibold" style="color: #F44336">Canceladas</span>
                            <span>{appointmentStats.cancelled}</span>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="flex items-center justify-center h-64 text-center">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-lg font-medium mt-4 text-blue-800">Usted todavía no ha agendado ninguna cita</p>
                        <p class="mt-2 text-gray-600">Agende su primera cita para ver su progreso aquí.</p>
                    </div>
                </div>
            {/if}
        </div>
        
        <!-- Información general del paciente -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <h3 class="font-medium text-lg mb-3 text-blue-700">Información general del paciente</h3>
            <div class="space-y-2">
                <p><strong>Nombre:</strong> {informacionPaciente.nombre}</p>
                <p><strong>Apellidos:</strong> {informacionPaciente.apellido_p} {informacionPaciente.apellido_m}</p>
                <p><strong>Edad:</strong> {informacionPaciente.age} años</p>
                <p><strong>Peso:</strong> {informacionPaciente.weight} kg</p>
                <p><strong>Altura:</strong> {informacionPaciente.height} cm</p>
                <p><strong>Género:</strong> {informacionPaciente.gender}</p>
                <p><strong>Tipo de Sangre:</strong> {informacionPaciente.blood_type}</p>
            </div>
        </div>
    </div>
</div>