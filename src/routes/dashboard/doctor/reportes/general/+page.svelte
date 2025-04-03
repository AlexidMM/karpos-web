<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    export let data: PageData;

    let startDate = '';
    let endDate = '';
    let selectedDoctor = 'all';
    let loading = false;
    let error = '';

    const doctors = data.doctors;
    const stats = data.stats;

    async function generateReport() {
        if (!startDate || !endDate) {
            error = 'Por favor selecciona un rango de fechas';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch(`/dashboard/doctor/reportes/general/generate?startDate=${startDate}&endDate=${endDate}&doctorId=${selectedDoctor}`);
            
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-general-${startDate}-${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            error = 'Error al generar el reporte. Por favor intenta de nuevo.';
            console.error('Error:', err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Reporte General del Consultorio</h1>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input
                    type="date"
                    bind:value={startDate}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Fecha Fin</label>
                <input
                    type="date"
                    bind:value={endDate}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Doctor</label>
                <select
                    bind:value={selectedDoctor}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="all">Todos los doctores</option>
                    {#each doctors as doctor}
                        <option value={doctor.id_dc}>{doctor.name} {doctor.lastname}</option>
                    {/each}
                </select>
            </div>
        </div>
        <div class="mt-4">
            <button
                on:click={generateReport}
                disabled={loading}
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
                {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
        </div>
    </div>

    <!-- Resumen de Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-2">Total de Citas</h3>
            <p class="text-3xl font-bold text-blue-500">{stats.totalAppointments}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-2">Completadas</h3>
            <p class="text-3xl font-bold text-green-500">{stats.statusCounts.completed}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-2">Pendientes</h3>
            <p class="text-3xl font-bold text-yellow-500">{stats.statusCounts.pending}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-2">Canceladas</h3>
            <p class="text-3xl font-bold text-red-500">{stats.statusCounts.cancelled}</p>
        </div>
    </div>

    <!-- Estadísticas por Doctor -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
        <h2 class="text-xl font-bold mb-4">Estadísticas por Doctor</h2>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completadas</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendientes</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canceladas</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each stats.doctorStats as doctor}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doctor.name} {doctor.lastname}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.appointmentCount}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-500">{doctor.completedCount}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">{doctor.pendingCount}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500">{doctor.cancelledCount}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span class="block sm:inline">{error}</span>
        </div>
    {/if}
</div> 