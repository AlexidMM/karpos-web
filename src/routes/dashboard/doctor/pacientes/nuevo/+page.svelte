<!-- src/routes/dashboard/doctor/pacientes/nuevo/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';

    let nombre = '';
    let apellido_p = '';
    let apellido_m = '';
    let age = '';
    let weight = '';
    let height = '';
    let gender = '';
    let blood_type = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    
    let error = '';
    let success = '';
    let isLoading = false;

    $: passwordMatch = password === confirmPassword;

    async function handleSubmit() {
    error = '';
    success = '';
    isLoading = true;

    if (!email || !password || !nombre || !apellido_p) {
        error = 'Por favor completa los campos obligatorios.';
        isLoading = false;
        return;
    }

    if (!passwordMatch) {
        error = 'Las contraseñas no coinciden.';
        isLoading = false;
        return;
    }

    try {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('apellido_p', apellido_p);
        formData.append('apellido_m', apellido_m);
        formData.append('edad', age ? age.toString() : '');
        formData.append('weight', weight ? weight.toString() : '');
        formData.append('height', height ? height.toString() : '');
        formData.append('gender', gender);
        formData.append('blood_type', blood_type);
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch('/dashboard/doctor/pacientes/nuevo', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            error = result.error || 'Error al registrar el paciente.';
        } else {
            success = 'Paciente registrado correctamente.';
            setTimeout(() => goto('/dashboard/doctor/pacientes'), 1500);
        }
    } catch (err) {
        error = 'Error de conexión con el servidor.';
    } finally {
        isLoading = false;
    }
}

</script>


<div class="p-4 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-blue-800 mb-6">Registrar Nuevo Paciente</h2>
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{error}</span>
        </div>
    {/if}
    
    {#if success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{success}</span>
        </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Información de Usuario</h3>
            <div class="bg-blue-50 p-4 rounded-md">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                        Email <span class="text-red-500">*</span>
                    </label>
                    <input 
                        bind:value={email}
                        id="email"
                        type="email"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Contraseña <span class="text-red-500">*</span>
                    </label>
                    <input 
                        bind:value={password}
                        id="password"
                        type="password"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="confirmPassword">
                        Confirmar Contraseña <span class="text-red-500">*</span>
                    </label>
                    <input 
                        bind:value={confirmPassword}
                        id="confirmPassword"
                        type="password"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
            </div>
        </div>
        
        <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Información Personal</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="nombre">
                        Nombre
                    </label>
                    <input 
                        bind:value={nombre}
                        id="nombre"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="apellido_p">
                        Apellido Paterno
                    </label>
                    <input 
                        bind:value={apellido_p}
                        id="apellido_p"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="apellido_m">
                        Apellido Materno
                    </label>
                    <input 
                        bind:value={apellido_m}
                        id="apellido_m"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="age">
                        Edad
                    </label>
                    <input 
                        bind:value={age}
                        id="age"
                        type="number"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="weight">
                        Peso (kg)
                    </label>
                    <input 
                        bind:value={weight}
                        id="weight"
                        type="number"
                        step="0.01"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="height">
                        Altura (cm)
                    </label>
                    <input 
                        bind:value={height}
                        id="height"
                        type="number"
                        step="0.01"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="gender">
                        Género
                    </label>
                    <select 
                        bind:value={gender}
                        id="gender"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="blood_type">
                        Tipo de Sangre
                    </label>
                    <select 
                        bind:value={blood_type}
                        id="blood_type"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                
            </div>
        </div>
        
        <div class="flex items-center justify-between">
            <button 
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                disabled={isLoading}
            >
                {#if isLoading}
                    <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {/if}
                Guardar Paciente
            </button>
            
            <a 
                href="/dashboard/doctor/pacientes"
                class="text-blue-600 hover:text-blue-800"
            >
                Cancelar
            </a>
        </div>
    </form>
</div>