<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    // Propiedades del componente
    export let appointments: any[] = [];
    export let initialDate: Date = new Date();
    
    // Estado interno
    let currentDate = new Date(initialDate);
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Para emitir eventos
    const dispatch = createEventDispatcher();
    
    // Nombres de los meses en español
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Nombres de los días en español
    const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
    
    // Función para cambiar el mes
    function changeMonth(increment: number) {
      const newDate = new Date(currentYear, currentMonth + increment, 1);
      currentMonth = newDate.getMonth();
      currentYear = newDate.getFullYear();
    }
    
    // Función para obtener los días del mes actual
    function getDaysInMonth(year: number, month: number) {
      return new Date(year, month + 1, 0).getDate();
    }
    
    // Función para obtener el primer día de la semana del mes
    function getFirstDayOfMonth(year: number, month: number) {
      return new Date(year, month, 1).getDay();
    }
    
    // Función para verificar si hay citas pendientes en una fecha específica
    function hasAppointment(day: number): boolean {
      const dateToCheck = new Date(currentYear, currentMonth, day);
      
      return appointments.some(appointment => {
        const appointmentDate = new Date(appointment.date || appointment.appointment_date);
        return (
          appointmentDate.getDate() === day &&
          appointmentDate.getMonth() === currentMonth &&
          appointmentDate.getFullYear() === currentYear &&
          appointment.status === 'pending'
        );
      });
    }
    
    // Función para manejar el clic en un día
    function handleDayClick(day: number) {
      const selectedDate = new Date(currentYear, currentMonth, day);
      dispatch('daySelect', {
        date: selectedDate,
        hasAppointment: hasAppointment(day)
      });
    }
    
    // Calcula los días para mostrar
    $: daysInMonth = getDaysInMonth(currentYear, currentMonth);
    $: firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Genera el arreglo de días para el grid
    $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    $: emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    $: calendarDays = [...emptyDays, ...days];
  </script>
  
  <div class="calendar">
    <div class="calendar-header flex justify-between items-center mb-3">
      <button 
        class="calendar-nav-btn px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded-lg text-blue-700"
        on:click={() => changeMonth(-1)}
      >
        &lt;
      </button>
      <h3 class="font-medium text-blue-800">
        {monthNames[currentMonth]} {currentYear}
      </h3>
      <button 
        class="calendar-nav-btn px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded-lg text-blue-700"
        on:click={() => changeMonth(1)}
      >
        &gt;
      </button>
    </div>
    
    <div class="day-names grid grid-cols-7 mb-1">
      {#each dayNames as day}
        <div class="text-center text-xs text-blue-700">{day}</div>
      {/each}
    </div>
    
    <div class="calendar-grid grid grid-cols-7 gap-1">
      {#each calendarDays as day}
        {#if day !== null}
          <div 
            class="day-cell h-8 w-8 rounded-full flex items-center justify-center cursor-pointer
                  {hasAppointment(day) ? 'bg-blue-500 text-white font-semibold' : 'bg-blue-200 hover:bg-blue-300 text-blue-700'}"
            on:click={() => handleDayClick(day)}
          >
            {day}
          </div>
        {:else}
          <div class="empty-day h-8 w-8"></div>
        {/if}
      {/each}
    </div>
  </div>