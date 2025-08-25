<script lang="ts">
  import Navbar from "$lib/ui/navbar.svelte";
  import { onMount } from "svelte";
  import storePromise from "$lib/store";
  
  import TileLayer from "ol/layer/Tile";
  import OSM from 'ol/source/OSM';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from "ol/source/Vector";
  import { fromLonLat } from "ol/proj";
  import { Feature, Map, View } from "ol";
  import { Point } from "ol/geom";
  import Style from "ol/style/Style";
  import Icon from "ol/style/Icon";
  import generatePlaneIcon from "$lib/generatePlaneIcon";
  import "ol/ol.css";

  import { ArrowBigLeft, PlaneLanding, PlaneTakeoff } from "@lucide/svelte";

  let planes: any[] = [];
  let mapContainer: HTMLDivElement;

  let selectPlaneLoaded: boolean = false;
  let selectedPlaneData: any = null;

  onMount(async () => {
    try {
      let token = await (await storePromise).get("token");
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/app/flights/all`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch planes");
      }

      planes = await res.json();
    } catch (err) {
      console.error("Error fetching planes:", err);
    }

    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    const vectorLayer: any = new VectorLayer({
      source: new VectorSource(),
    });

    const map = new Map({
      target: mapContainer,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    planes.forEach(plane => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([plane.longitude, plane.latitude])),
        icao24: plane.icao24,
      });

      feature.setStyle(new Style({
        image: new Icon({
          src: generatePlaneIcon(plane.category),
          rotation: plane.trueTrack ? ((plane.trueTrack * Math.PI) / 180) : 0,
        }),
      }));

      vectorLayer.getSource().addFeature(feature);
    });

    map.on("singleclick", function (evt) {
      map.forEachFeatureAtPixel(evt.pixel, async function (feature) {
        if (feature.get("icao24")) {
          selectedPlaneData = planes.find(p => p.icao24 === feature.get("icao24"));

          try {
            let token = await (await storePromise).get("token");
            
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/app/flights/icao24/${selectedPlaneData.icao24}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              throw new Error("Failed to fetch plane details");
            }

            selectedPlaneData = await res.json();
            selectPlaneLoaded = true;
          } catch (err) {
            console.error("Error fetching plane details:", err);
          }
          
          return true;
        }
      });
    });
  });
</script>

<main class="flex flex-col flex-1">
  <div class="flex flex-1" bind:this={mapContainer}></div>

  <div class="mt-auto">
    <Navbar />
  </div>

   {#if selectedPlaneData}
    <div class="absolute top-0 left-0 h-screen w-full bg-ctp-base flex flex-col">
      <div class="bg-ctp-mantle h-12"></div>
      
      {#if selectPlaneLoaded}
        <div class="p-4">
          <div class="flex">
            <button 
              class="mr-4 mb-1.5"
              on:click={() => {
                selectedPlaneData = null;
                selectPlaneLoaded = false;
              }}
            >
              <ArrowBigLeft size={24} />
            </button>

            <h1 class="text-2xl font-bold ml-auto">{selectedPlaneData.callsign} ({selectedPlaneData.icao24})</h1>
          </div>

          {#if selectedPlaneData.callsignData?.airline}
            <p class="text-lg">
              Operated by <span class="font-bold">{selectedPlaneData.callsignData?.airline.name}</span> 
              from <span class="font-bold">{selectedPlaneData.callsignData?.airline.country || "Unknown"}</span>
            </p>
          {/if}

          <div class="mt-8 space-x-2 text-center flex">
            <div class="border rounded-md py-4 px-2 justify-center items-center w-full relative">
              {#if selectedPlaneData.callsignData?.origin}
                <h2 class="text-2xl font-bold">{selectedPlaneData.callsignData.origin.iata_code}</h2>
                <p class="text-lg font-semibold">{selectedPlaneData.callsignData.origin.municipality}, {selectedPlaneData.callsignData.origin.country_name}</p>
              {:else}
                <h2 class="text-2xl font-bold">N/A</h2>
                <p class="text-lg font-semibold">Origin Unknown</p>
              {/if}

              <div class="absolute top-[-12px] left-[-12px] rounded-full p-2 border bg-ctp-base">
                <PlaneTakeoff size={22} />
              </div>
            </div>

            <div class="border rounded-md py-4 px-2 justify-center items-center w-full relative">
              {#if selectedPlaneData.callsignData?.destination}
                <h2 class="text-2xl font-bold">{selectedPlaneData.callsignData.destination.iata_code}</h2>
              <p class="text-lg font-semibold">{selectedPlaneData.callsignData.destination.municipality}, {selectedPlaneData.callsignData.destination.country_name}</p>
              {:else}
                <h2 class="text-2xl font-bold">N/A</h2>
                <p class="text-lg font-semibold">Destination Unknown</p>
              {/if}

              <div class="absolute top-[-12px] right-[-12px] rounded-full p-2 border bg-ctp-base">
                <PlaneLanding size={22} />
              </div>
            </div>
          </div>

          <hr class="my-4 border border-ctp-surface0!" />

          <div class="mt-2 grid grid-cols-2 gap-4">
            <div class="rounded-md p-2 border flex flex-col">
              <p>Barometric Altitude</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.baroAltitude ? `${selectedPlaneData.baroAltitude.toFixed(0)} ft` : "N/A"}</p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>GPS Altitude</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.geoAltitude ? `${selectedPlaneData.geoAltitude.toFixed(0)} ft` : "N/A"}</p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>True Track</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.trueTrack ? `${selectedPlaneData.trueTrack.toFixed(0)}°` : "N/A"}</p> 
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>Velocity</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.velocity ? `${(selectedPlaneData.velocity).toFixed(0)} m/s` : "N/A"}</p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>Vertical Rate</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.verticalRate ? `${selectedPlaneData.verticalRate.toFixed(0)} m/s` : "N/A"}</p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>On Ground?</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.onGround ? "Yes" : "No"}</p>
            </div>
          </div>

          <hr class="my-4 border border-ctp-surface0!" />

          <div class="mt-2 grid grid-cols-2 gap-4">
            <div class="rounded-md p-2 border flex flex-col">
              <p>Data Source</p>
              <p class="font-semibold mx-auto text-lg">
                {selectedPlaneData.positionSource === 0 ? "ADS-B" 
                  : (selectedPlaneData.positionSource === 1 ? "ASTERIX" 
                    : (selectedPlaneData.positionSource === 2 ? "MLAT"
                      : selectedPlaneData.positionSource === 3 ? "FLARM"
                        : "Unknown"
                ))}
              </p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>Squawk</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.squawk || "N/A"}</p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>Latitude</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.latitude ? selectedPlaneData.latitude : "N/A"}</p>
            </div>

            <div class="rounded-md p-2 border flex flex-col">
              <p>Longitude</p>
              <p class="font-semibold mx-auto text-lg">{selectedPlaneData.longitude ? selectedPlaneData.longitude : "N/A"}</p>
            </div>
          </div>
        </div>
      {:else}
        <div class="m-auto p-4">
          <p>Loading...</p>
        </div>
      {/if}
    </div>
  {/if}
</main>