<!-- src/routes/dashboard/doctor/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    // Redireccionar a la página de pacientes por defecto
    onMount(() => {
        if ($page.url.pathname === '/dashboard/doctor') {
            goto('/dashboard/doctor/pacientes');
        }
    });
</script>

<div class="min-h-screen bg-blue-50">
    <!-- Encabezado -->
    <header class="bg-white shadow-md p-4 mb-6">
        <h1 class="text-2xl font-bold text-blue-800">🏥 Portal Médico</h1>
    </header>
    <div class="max-w-6xl mx-auto px-4">
        <!-- Barra de navegación -->
        <nav class="bg-white rounded-lg shadow-md mb-6">
            <div class="flex">
                <a 
                    href="/dashboard/doctor/citas"
                    class="px-6 py-3 font-medium text-gray-600 hover:text-blue-600"
                >
                    Citas
                </a>
                <a 
                    href="/dashboard/doctor/pacientes" 
                    class="px-6 py-3 font-medium text-gray-600 hover:text-blue-600"
                >
                    Pacientes
                </a>
                <a 
                    href="/dashboard/doctor/reportes"
                    class="px-6 py-3 font-medium text-gray-600 hover:text-blue-600"
                >
                    Reportes
                </a>
                <div class="ml-auto">
                    <form method="POST" action="/auth/logout">
                        <button
                            type="submit"
                            class="px-6 py-3 font-medium text-red-600 hover:text-red-800"
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </nav>
        
        <main class="bg-white rounded-lg shadow-md p-6">
            <slot></slot>
        </main>
    </div>
</div>