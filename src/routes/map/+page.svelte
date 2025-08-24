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
  import "ol/ol.css";
    import Style from "ol/style/Style";
    import Icon from "ol/style/Icon";
    import generatePlaneIcon from "$lib/generatePlaneIcon";

  let planes: any[] = [];

  let mapContainer: HTMLDivElement;

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
        name: plane.callsign,
      });

      feature.setStyle(new Style({
        image: new Icon({
          src: generatePlaneIcon(plane.category),
          rotation: plane.trueTrack ? ((plane.trueTrack * Math.PI) / 180) : 0,
        }),
      }));

      vectorLayer.getSource().addFeature(feature);
    });
  });
</script>

<main class="flex flex-col flex-1">
  <div class="flex flex-1" bind:this={mapContainer}></div>

  <div class="mt-auto">
    <Navbar />
  </div>
</main>