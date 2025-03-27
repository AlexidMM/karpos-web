<!-- src/routes/dashboard/patient/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    // Redireccionar a la página de home por defecto
    onMount(() => {
        if ($page.url.pathname === '/dashboard/patient') {
            goto('/dashboard/patient/home');
        }
    });
</script>

<h1 class="text-2xl font-bold">👨‍⚕️ Bienvenido, Paciente</h1>
<p>Esta es tu pantalla personalizada.</p>