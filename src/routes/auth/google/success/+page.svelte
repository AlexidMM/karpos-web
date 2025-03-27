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

            const data = await response.json();
            console.log("✅ Tokens guardados correctamente:", data);

            // ⚠️ Agregamos un pequeño delay para que las cookies se propaguen
            setTimeout(() => {
                if (data.role === 'doctor') {
                    goto('/dashboard/doctor');
                } else if (data.role === 'patient') {
                    goto('/dashboard/patient');
                } else if (data.role === 'admin') {
                    goto('/admin');
                } else {
                    goto('/');
                }
            }, 800); // Aumentamos el delay un poco
        } catch (error) {
            console.error('❌ Error:', error);
            goto('/login?error=process_failed');
        }
    });
</script>
