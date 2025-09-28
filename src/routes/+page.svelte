<script lang="ts">
  import storePromise from "$lib/store";
  import Navbar from "$lib/ui/navbar.svelte";
  import { ArrowBigLeft, PlaneLanding, PlaneTakeoff } from "@lucide/svelte";

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

<main class="flex flex-col h-[calc(100vh-3rem)] w-full">
  <div class="p-4 pb-2 flex flex-col h-full min-h-0">
    {#if !searched && !kbVisible}
      <h1 class="text-2xl font-bold">My Flights ✈️</h1>

      <p>TODO: implement this 😭</p>
    {/if}

    <div class={"duration-500 " + (searched || kbVisible ? "h-0" : "h-full")}></div>

    <div class="flex flex-shrink-0">
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
        placeholder="Search for callsign / tail number / airline" 
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
        <div class="flex flex-col overflow-y-auto">
          {#if result.aircraft}
            <div class="px-4 py-2 rounded-md bg-ctp-mantle mt-2 border">
              <div class="flex">
                <h2 class="text-xl font-semibold">{result.aircraft.registration}</h2>
                <p class="text-lg ml-auto">
                  {result.aircraft.manufacturer} {result.aircraft.icao_type}
                </p>
              </div>
              
              <p class="text-lg mt-1">
                Owned by {result.aircraft.registered_owner}
              </p>

              {#if result.aircraft.url_photo}
                <img 
                  src={result.aircraft.url_photo} 
                  alt="Aircraft_Image" 
                  class="mt-2 rounded-md w-full h-auto"
                />
              {/if}
            </div>
          {/if}

          {#if result.callsign}
            <div class="px-4 py-2 rounded-md bg-ctp-mantle mt-2 border">
              <h2 class="text-xl font-semibold">{result.callsign.callsign_icao} / {result.callsign.callsign_iata || "no iata"}</h2>
              
              <p class="text-lg mt-1">
                Operated by {result.callsign.airline.name} ({result.callsign.airline.iata || "no iata"} / {result.callsign.airline.icao || "no icao"})
              </p>

              <br />

              <p class="text-lg flex">
                <PlaneTakeoff class="mr-2" /> {result.callsign.origin.municipality} ({result.callsign.origin.iata_code})
              </p>

              <p class="text-lg flex">
                <PlaneLanding class="mr-2" /> {result.callsign.destination.municipality} ({result.callsign.destination.iata_code})
              </p>
            </div>
          {/if}

          {#each result.airlines as airline}
            <div class="px-4 py-2 border rounded-md bg-ctp-mantle mt-2">
              <h2 class="font-semibold text-xl">{airline.name}</h2>

              {#if airline.alias}
                <p class="text-lg">Also know as {airline.alias}</p>
              {/if}

              <p class="mt-2">IATA code: {airline.iata || "N/A"}</p>
              <p>ICAO code: {airline.icao || "N/A"}</p>
              <p>Callsign: {airline.callsign || "N/A"}</p>
              <p>Country: {airline.country || "N/A"}</p>
            </div>
          {/each}
        </div>
      {:else if !searchFinished}
        <p class="mx-auto mt-8">Searching...</p>
      {:else}
        <p class="mx-auto mt-8">No results found</p>
      {/if}
    {/if}
  </div>

  <div class="mt-auto flex-shrink-0">
    <Navbar />
  </div>
</main>