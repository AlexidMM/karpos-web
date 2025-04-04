<!-- src/routes/dashboard/doctor/pacientes/[id]/historial/editar/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    
    export let data: {
        patientId: string;
        medicalRecordId: string;
        medicalRecord: {
            diagnosis: string;
            treatment: string;
            notes?: string;
        };
        accessToken: string;
    };
    
    let patientId: string = data.patientId;
    let medicalRecordId: string = data.medicalRecordId;
    let accessToken = data.accessToken;

    let isSaving = false;
    let errorMessage: string | null = null;
    let successMessage: string | null = null;
    
    // Inicializa los valores directamente desde data.medicalRecord
    let diagnosis = data.medicalRecord.diagnosis || '';
    let treatment = data.medicalRecord.treatment || '';
    let notes = data.medicalRecord.notes || '';
    
    async function handleSubmit() {
        isSaving = true;
        errorMessage = null;
        
        try {
            const response = await fetch(`http://10.224.0.3:3001/medical-records/${medicalRecordId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    id_pc: Number(patientId),
                    diagnosis,
                    treatment,
                    notes: notes || undefined // Si está vacío, enviamos undefined para que use el valor por defecto
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el Expediente clínico');
            }
            
            successMessage = 'Expediente clínico actualizado correctamente';
            
            // Redirigir después de un breve tiempo
            setTimeout(() => {
                goto(`/dashboard/doctor/pacientes/${patientId}`);
            }, 2000);
            
        } catch (error) {
            console.error('Error updating medical record:', error);
            errorMessage = error instanceof Error ? error.message : 'Error inesperado al actualizar historial médico';
        } finally {
            isSaving = false;
        }
    }
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-blue-800">Editar Expediente clínico</h2>
    </div>
    
    {#if errorMessage}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{errorMessage}</span>
        </div>
    {/if}
    
    {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{successMessage}</span>
        </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-lg shadow p-6">
        <div class="mb-4">
            <label for="diagnosis" class="block text-gray-700 font-bold mb-2">Diagnóstico</label>
            <textarea 
                id="diagnosis"
                bind:value={diagnosis}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
            ></textarea>
        </div>
        
        <div class="mb-4">
            <label for="treatment" class="block text-gray-700 font-bold mb-2">Tratamiento</label>
            <textarea 
                id="treatment"
                bind:value={treatment}
                required
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
            ></textarea>
        </div>
        
        <div class="mb-6">
            <label for="notes" class="block text-gray-700 font-bold mb-2">Notas (opcional)</label>
            <textarea 
                id="notes"
                bind:value={notes}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
            ></textarea>
        </div>
        
        <div class="flex items-center justify-between">
            <button 
                type="submit"
                disabled={isSaving}
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
                {isSaving ? 'Guardando...' : 'Actualizar Expediente clínico'}
            </button>
            
            <a 
                href="/dashboard/doctor/pacientes/{patientId}"
                class="text-blue-600 hover:text-blue-800">
                Cancelar
            </a>
        </div>
    </form>
</div>