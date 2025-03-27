<!-- src/routes/dashboard/doctor/pacientes/[id]/+page.svelte -->
<script lang="ts">
    export let data: {
        patient: {
            id_pc: number;
            nombre: string;
            apellido_p: string;
            apellido_m: string;
            age: number;
            weight: number;
            height: number;
            gender: string;
            blood_type: string;
            diagnosis?: string;
            treatment?: string;
            notes?: string;
            created_at?: string;
            updated_at?: string;
        };
        hasError: boolean;
    };
    
    let patient = data.patient;
    let isLoading = !patient;
    let errorMessage: string | null = null;
    let isGeneratingPDF = false;
    
    function downloadMedicalRecordPDF() {
        if (!patient) {
            alert("No se puede generar el PDF sin datos del paciente");
            return;
        }
        
        isGeneratingPDF = true;
        window.open(`/dashboard/doctor/pacientes/${patient.id_pc}/pdf`, '_blank');
        
        setTimeout(() => {
            isGeneratingPDF = false;
        }, 3000);
    }
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-blue-800">Detalles del Paciente</h2>
    </div>
    
    {#if errorMessage}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span class="block sm:inline">{errorMessage}</span>
        </div>
    {/if}
    
    {#if isLoading}
        <div class="flex justify-center my-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if patient}
        <!-- Sección de Datos Básicos -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <div class="grid grid-cols-2 gap-6">
                <div>
                    <strong class="text-gray-700">Nombre:</strong>
                    <p>{patient.nombre} {patient.apellido_p} {patient.apellido_m}</p>
                </div>
                <div>
                    <strong class="text-gray-700">Edad:</strong>
                    <p>{patient.age}</p>
                </div>
                <div>
                    <strong class="text-gray-700">Peso:</strong>
                    <p>{patient.weight} kg</p>
                </div>
                <div>
                    <strong class="text-gray-700">Altura:</strong>
                    <p>{patient.height} cm</p>
                </div>
                <div>
                    <strong class="text-gray-700">Género:</strong>
                    <p>{patient.gender}</p>
                </div>
                <div>
                    <strong class="text-gray-700">Tipo de Sangre:</strong>
                    <p>{patient.blood_type}</p>
                </div>
            </div>
        </div>
        
        <!-- Sección del Historial Médico -->
        <div class="mt-8">
            <h2 class="text-2xl font-bold text-blue-800 mb-4">Expediente Clínico</h2>
            
            {#if patient.diagnosis || patient.treatment || patient.notes}
                <div class="bg-white rounded-lg shadow p-6 mb-4">
                    {#if patient.diagnosis}
                        <div class="mb-4">
                            <strong class="text-gray-700 block mb-1">Diagnóstico:</strong>
                            <p class="bg-gray-50 p-3 rounded">{patient.diagnosis}</p>
                        </div>
                    {/if}
                    
                    {#if patient.treatment}
                        <div class="mb-4">
                            <strong class="text-gray-700 block mb-1">Tratamiento:</strong>
                            <p class="bg-gray-50 p-3 rounded">{patient.treatment}</p>
                        </div>
                    {/if}
                    
                    {#if patient.notes}
                        <div class="mb-4">
                            <strong class="text-gray-700 block mb-1">Notas:</strong>
                            <p class="bg-gray-50 p-3 rounded">{patient.notes}</p>
                        </div>
                    {/if}
                    
                    {#if patient.created_at}
                        <div class="text-sm text-gray-500 mt-2">
                            <p>Creado: {new Date(patient.created_at).toLocaleString()}</p>
                            {#if patient.updated_at}
                                <p>Última actualización: {new Date(patient.updated_at).toLocaleString()}</p>
                            {/if}
                        </div>
                    {/if}
                </div>
                
                <div class="flex space-x-4 mt-4">
                    <a 
                        href="/dashboard/doctor/pacientes/{patient.id_pc}/historial/editar"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Editar Expediente Clínico
                    </a>
                    <button 
                        on:click={downloadMedicalRecordPDF}
                        disabled={isGeneratingPDF}
                        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center">
                        {#if isGeneratingPDF}
                            <div class="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        {/if}
                        Mostrar Expediente Clínico en PDF
                    </button>
                </div>
            {:else}
                <div class="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                    <span class="block sm:inline">Este paciente no tiene un Expediente Clínico registrado.</span>
                </div>
                
                <a 
                    href="/dashboard/doctor/pacientes/{patient.id_pc}/historial/crear"
                    class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2">
                    Crear Expediente Clínico
                </a>
            {/if}
        </div>
        
        <div class="mt-8">
            <a 
                href="/dashboard/doctor/pacientes"
                class="text-blue-600 hover:text-blue-800">
                Regresar
            </a>
        </div>
    {/if}
</div>