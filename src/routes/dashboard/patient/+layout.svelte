<!-- src/routes/dashboard/patient/+layout.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    const { isAuthenticated, userRole } = $page.data;

    onMount(() => {
        // Redirigir si no está autenticado o no es un paciente
        if (!isAuthenticated) {
            goto('/');
        } else if (userRole !== 'patient') {
            // Redirigir al dashboard correspondiente según el rol
            goto(`/dashboard/${userRole}`);
        }
    });
</script>

<div class="min-h-screen bg-blue-50">
    <!-- Encabezado -->
    <header class="bg-white shadow-md p-4 mb-6">
        <h1 class="text-2xl font-bold text-blue-800">🏥 Portal de Pacientes</h1>
    </header>
    <div class="max-w-6xl mx-auto px-4">
        <!-- Barra de navegación -->
        <nav class="bg-white rounded-lg shadow-md mb-6">
            <div class="flex">
                <a 
                    href="/dashboard/patient/home"
                    class="px-6 py-3 font-medium {$page.url.pathname.includes('/home') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}"
                >
                    Home
                </a>
                <a 
                    href="/dashboard/patient/perfil"
                    class="px-6 py-3 font-medium {$page.url.pathname.includes('/perfil') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}"
                >
                    Perfil
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