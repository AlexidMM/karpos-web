<!-- src/routes/+page.svelte -->
<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    onMount(() => {
      goto('/auth');
    });
  </script>
  
  <div>Redirigiendo...</div>