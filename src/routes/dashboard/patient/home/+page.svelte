<!-- src/routes/dashboard/patient/home/+page.svelte -->
<script lang="ts">
    import Calendar from '$lib/components/Calendar.svelte';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    
    export let data;
    
    const { patient, appointments } = data;
    
    interface Appointment {
        appointment_id: number;
        patient_id: number;
        id_pc: number;
        status: string;
        patient_name: string;
        doctor_name: string;
        appointment_date: string;
        appointment_time: string;
    }

    let selectedDate: Date | null = null;
    let selectedDateAppointments: Appointment[] = [];
    
    // Función para manejar la selección de un día en el calendario
    function handleDaySelect(event: CustomEvent<{ date: Date; hasAppointment: boolean; isPast: boolean }>) {
      selectedDate = event.detail.date;
      
      // Filtrar citas para el día seleccionado
      selectedDateAppointments = selectedDate
        ? appointments.all.filter(appointment => {
            const appointmentDate = new Date(appointment.appointment_date);
            return (
              appointmentDate.getDate() === selectedDate!.getDate() &&
              appointmentDate.getMonth() === selectedDate!.getMonth() &&
              appointmentDate.getFullYear() === selectedDate!.getFullYear()
            );
          })
        : [];
    }
    
    // Obtener la próxima cita pendiente (para el recordatorio)
    $: nextAppointment = appointments.pending.length > 0 
      ? appointments.pending
          .filter(app => new Date(app.appointment_date) >= new Date()) // Filtrar citas pasadas
          .sort((a, b) => {
              const dateA = new Date(a.appointment_date);
              const dateB = new Date(b.appointment_date);
              return dateA.getTime() - dateB.getTime();
          })[0]
      : null;
      
    // Calcular días para la próxima cita
    $: daysUntilNext = nextAppointment ? Math.ceil((new Date(nextAppointment.appointment_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  </script>
  
  <div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
      <div class="flex justify-between items-center mb-4 bg-blue-100 p-3 rounded-t-lg border-b border-blue-300">
          <h2 class="text-xl font-semibold">📋 Perfil</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Historial de sesiones -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
              <h3 class="font-medium text-lg mb-2 text-red-700">Historial de sesiones agendadas</h3>
              {#if appointments.all.length > 0}
                  <ul class="space-y-2">
                      {#each appointments.all.slice(0, 5) as appointment}
                          <li class="p-2 rounded {
                              new Date(appointment.appointment_date) < new Date() 
                                ? 'bg-gray-100 border-l-4 border-gray-400' 
                                : appointment.status === 'pending' 
                                  ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                                  : appointment.status === 'completed' 
                                    ? 'bg-green-50 border-l-4 border-green-400' 
                                    : 'bg-gray-50 border-l-4 border-gray-400'
                          }">
                              <div class="text-sm font-medium">
                                  {format(new Date(appointment.appointment_date), 'PPP', { locale: es })}
                              </div>
                              <div class="text-xs text-gray-600">
                                  Estado: <span class="font-semibold {
                                      new Date(appointment.appointment_date) < new Date()
                                        ? 'text-gray-600'
                                        : appointment.status === 'pending' 
                                          ? 'text-yellow-600' 
                                          : appointment.status === 'completed' 
                                            ? 'text-green-600' 
                                            : 'text-gray-600'
                                  }">
                                      {new Date(appointment.appointment_date) < new Date()
                                        ? 'Pasada'
                                        : appointment.status === 'pending' 
                                          ? 'Pendiente' 
                                          : appointment.status === 'completed' 
                                            ? 'Completada' 
                                            : 'Cancelada'}
                                  </span>
                              </div>
                          </li>
                      {/each}
                  </ul>
                  {#if appointments.all.length > 5}
                      <div class="text-center mt-2">
                          <a href="/dashboard/patient/appointments" class="text-blue-600 text-sm hover:underline">
                              Ver todas ({appointments.all.length})
                          </a>
                      </div>
                  {/if}
              {:else}
                  <p class="text-gray-600">No hay sesiones registradas</p>
              {/if}
          </div>
          
          <!-- Calendario -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <h3 class="font-medium text-lg mb-2 text-blue-700">Calendario</h3>
              <Calendar 
                  appointments={appointments.pending} 
                  on:daySelect={handleDaySelect} 
              />
              
              {#if selectedDate}
                  <div class="mt-3 p-2 bg-blue-100 rounded-lg">
                      <h4 class="font-medium text-blue-800">
                          {format(selectedDate, 'PPP', { locale: es })}
                      </h4>
                      {#if selectedDateAppointments.length > 0}
                          <ul class="mt-1 space-y-1">
                              {#each selectedDateAppointments as appointment}
                                  <li class="text-sm {
                                      new Date(appointment.appointment_date) < new Date()
                                        ? 'text-gray-700'
                                        : appointment.status === 'pending' 
                                          ? 'text-yellow-700' 
                                          : 'text-green-700'
                                  }">
                                      {new Date(appointment.appointment_date) < new Date()
                                        ? 'Cita pasada'
                                        : appointment.status === 'pending' 
                                          ? 'Cita pendiente' 
                                          : 'Cita completada'}
                                      {#if appointment.appointment_time}
                                          a las {appointment.appointment_time}
                                      {/if}
                                  </li>
                              {/each}
                          </ul>
                      {:else}
                          <p class="text-sm text-gray-600">No hay citas para este día</p>
                      {/if}
                  </div>
              {/if}
          </div>
          
          <!-- Recordatorios -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
              <h3 class="font-medium text-lg mb-2 text-red-700">Recordatorio</h3>
              {#if nextAppointment}
                  <div class="p-2 bg-white rounded-lg border border-red-100 shadow-sm">
                      <p class="font-medium text-red-600">
                          {daysUntilNext === 0 ? '¡Tienes una cita hoy!' : 
                           daysUntilNext === 1 ? 'Falta 1 día para tu cita' : 
                           `Faltan ${daysUntilNext} días para tu cita`}
                      </p>
                      <p class="text-sm text-gray-600 mt-1">
                          Fecha: {format(new Date(nextAppointment.appointment_date), 'PPP', { locale: es })}
                      </p>
                      {#if nextAppointment.appointment_time}
                          <p class="text-sm text-gray-600">
                              Hora: {nextAppointment.appointment_time}
                          </p>
                      {/if}
                  </div>
              {:else}
                  <p class="text-gray-600">No tienes citas pendientes</p>
              {/if}
          </div>
      </div>
  </div>