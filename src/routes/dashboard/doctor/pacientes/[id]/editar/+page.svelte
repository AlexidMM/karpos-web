<!-- src/routes/dashboard/doctor/pacientes/[id]/editar/+page.svelte -->
<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from '$app/navigation';
    export let data;
    
    // Depuración
    console.log("Data recibida:", data);
    
    // Obtenemos el primer paciente del array
    let patient = Array.isArray(data.patient) && data.patient.length > 0 
        ? data.patient[0] 
        : {};
    
    // Depuración después de la corrección
    console.log("Paciente extraído del array:", patient);
    
    // Asigna valores con fallback explícito
    let nombre = patient?.nombre || '';
    let apellido_p = patient?.apellido_p || '';
    let apellido_m = patient?.apellido_m || '';
    let edad = patient?.age?.toString() || '';
    let weight = patient?.weight?.toString() || '';
    let height = patient?.height?.toString() || '';
    let gender = patient?.gender || '';
    let blood_type = patient?.blood_type || '';
    let isLoading = false;
    let error: string | null = null;
    let success: string | null = null;
    
    // También necesitamos asegurarnos de enviar el ID correcto
    let patientId = patient?.id_pc;
    
    function handleEnhance() {
        return async ({ result }: { result: { type: string; error?: { message: string } } }) => {
            isLoading = true;
            
            if (result.type === 'success') {
                success = 'Paciente actualizado exitosamente.';
                setTimeout(() => goto('/dashboard/doctor/pacientes'), 1500);
            } else if (result.type === 'error') {
                error = result.error?.message || 'Error al actualizar el paciente.';
            }
            
            isLoading = false;
        };
    }
</script>

<div class="p-4 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold text-blue-800 mb-6">Editar Paciente</h2>

    
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
    <form method="POST" action="?/update" use:enhance={handleEnhance} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <!-- Campo oculto para el ID del paciente -->
        <input type="hidden" name="id_pc" value={patientId} />
        
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="nombre">Nombre</label>
            <input id="nombre" type="text" name="nombre" bind:value={nombre} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="apellido_p">Apellido Paterno</label>
            <input id="apellido_p" type="text" name="apellido_p" bind:value={apellido_p} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="apellido_m">Apellido Materno</label>
            <input id="apellido_m" type="text" name="apellido_m" bind:value={apellido_m} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="edad">Edad</label>
            <input id="edad" type="text" name="edad" bind:value={edad} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="weight">Peso</label>
            <input id="weight" type="text" name="weight" bind:value={weight} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="height">Altura</label>
            <input id="height" type="text" name="height" bind:value={height} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="gender">Género</label>
            <input id="gender" type="text" name="gender" bind:value={gender} class="input" />
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="blood_type">Tipo de Sangre</label>
            <input id="blood_type" type="text" name="blood_type" bind:value={blood_type} class="input" />
        </div>
        <div class="flex items-center justify-between">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
                {isLoading ? 'Actualizando...' : 'Actualizar'}
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

<style>
    .input {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        appearance: none;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        width: 100%;
        padding: 0.5rem 0.75rem;
        color: #4a5568;
        line-height: 1.25;
        outline: none;
        transition: box-shadow 0.2s;
    }
    .input:focus {
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
    }
</style>