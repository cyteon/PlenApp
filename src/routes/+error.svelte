<script lang="ts">
    import { goto } from "$app/navigation";
  import { page } from "$app/state";

  if (page.status === 404) {
    goto("/")
  }
</script>

<div class="flex flex-col h-screen">
  <div class="m-auto font-semibold flex flex-col">
    <h1 class="text-3xl text-ctp-red">Error {page.status}: {page.error.message}</h1>
    <a href="/" class="text-center text-ctp-blue mt-4 hover:underline">
        Go home
    </a>
  </div>
</div>