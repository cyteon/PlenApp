<script lang="ts">
    import storePromise from "$lib/store";
  import Navbar from "$lib/ui/navbar.svelte";
    import { ArrowBigLeft } from "@lucide/svelte";

  let kbVisible: boolean = false;

  let searchQuery: string = "";
  let searched: boolean = false;
  let searchFinished: boolean = false;
  
  let result: {
    airlines: any[];
    airports: any[];
    callsign: any; // just 1 of this
    aircraft: any; // 1 of this too
  } | null = null;

  async function search() {
    if (searchQuery.trim() === "") {
      return;
    }

    try {
      const token = await (await storePromise).get("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/app/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );

      if (!res.ok) {
        result = null;
        searchFinished = true;
        return;
      }

      result = await res.json();
      searchFinished = true;
    } catch (err) {
      console.error("Error during search:", err);
      result = null;
      searchFinished = true;
    }
  }
</script>

<main class="flex flex-col flex-1">
  <div class="p-4 pb-2 flex flex-col h-full">
    {#if !searched && !kbVisible}
      <h1 class="text-2xl font-bold">My Flights ✈️</h1>

      <p>TODO: implement this 😭</p>
    {/if}

    <div class={"duration-500 " + (searched || kbVisible ? "h-0" : "h-full")}></div>

    <div class="flex">
      {#if searched}
        <button 
          class="mr-4 mb-1.5"
          on:click={() => {
            searched = false;
            searchQuery = "";
          }}
        >
          <ArrowBigLeft size={24} />
        </button>
      {/if}

      <input 
        type="text" 
        placeholder="Search for callsign / tail number / airport / airline" 
        class="w-full p-2 mb-2 border rounded-md text-lg truncate"
        bind:value={searchQuery}
        on:focus={() => kbVisible = true}
        on:blur={() => kbVisible = false}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            if (searchQuery.trim() === "") {
              searched = false;
            } else {
              searched = true;
              kbVisible = false;

              search();
            }
          }
        }}
      />
    </div>

    {#if searched}
      {#if result}
        test
      {:else if !searchFinished}
        <p class="mx-auto mt-8">Searching...</p>
      {:else}
        <p class="mx-auto mt-8">No results found</p>
      {/if}
    {/if}
  </div>

  <div class="mt-auto">
    <Navbar />
  </div>
</main>