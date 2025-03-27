<!--src/routes/+layout.svelte-->

<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { goto } from '$app/navigation';

  interface AuthData {
      isAuthenticated: boolean;
      userRole: 'doctor' | 'patient' | 'admin' | null;
      redirect?: string;
  }

  const { children, data } = $props<{ children: any; data: AuthData }>();

  // 🛑 Solo redirige si el usuario está autenticado y hay un redirect
  onMount(() => {
      if (data.isAuthenticated && data.redirect) {
          goto(data.redirect);
      }
  });
</script>

{@render children()}
