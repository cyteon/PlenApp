<script>
    import { House, Map } from "@lucide/svelte";
</script>

<nav class="bg-ctp-mantle pt-4 pb-6 px-6 flex justify-center items-center h-22">
    <a class={`mx-auto ${window.location.pathname == "/" ? "text-ctp-blue" : ""}`} href="/">
        <House size={28} />
    </a>

    <a class={`mx-auto ${window.location.pathname == "/map" ? "text-ctp-blue" : ""}`} href="/map">
        <Map size={28} />
    </a>
</nav>