<!-- src/routes/auth/+page.svelte -->
<script lang="ts">
    const handleGoogleLogin = () => {
        window.location.href = 'http://10.224.0.3:3001/auth/google/';
    };
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">Iniciar Sesión</h2>
        <form method="POST" class="space-y-4">
            <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
                type="password" 
                name="password" 
                placeholder="Contraseña" 
                required 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
                type="submit" 
                class="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
            >
                Entrar
            </button>
        </form>
        <div class="relative flex items-center justify-center my-4">
            <div class="w-full border-t border-gray-300"></div>
            <span class="absolute bg-white px-4 text-gray-500">o</span>
        </div>
        <button 
            type="button" 
            on:click={handleGoogleLogin} 
            class="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
        >
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" class="w-5 h-5" />
            <span>Inicie sesión con Google</span>
        </button>
    </div>
</div>