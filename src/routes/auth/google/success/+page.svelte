<!-- src/routes/auth/google/success/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    onMount(async () => {
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        console.log("🔍 Google Login - Access Token:", accessToken);
        console.log("🔍 Google Login - Refresh Token:", refreshToken);

        if (!accessToken || !refreshToken) {
            console.error('❌ Tokens no encontrados en la URL');
            goto('/login?error=missing_tokens');
            return;
        }

        try {
            // Guardar los tokens en las cookies
            const response = await fetch('/auth/save-google-tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken, refreshToken })
            });

            if (!response.ok) {
                throw new Error('Error al guardar tokens');
            }

            // La respuesta será una redirección, así que seguimos la redirección
            const redirectUrl = response.headers.get('Location');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                throw new Error('No se recibió URL de redirección');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            goto('/login?error=process_failed');
        }
    });
</script>

<div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
        <h2 class="text-xl font-semibold mb-4">Procesando inicio de sesión...</h2>
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>
</div>
