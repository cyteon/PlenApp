<script>
    import { onMount } from "svelte";
    import "../app.css";
    import { goto } from "$app/navigation";
    import store from "../lib/store";

    let { children } = $props();

    onMount(async () => {
        let token = await (await store).get("token");
        console.log("Token from store:", token);
        
        if (!token) {
            goto("/login");
        } else {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/app/auth/verify`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log("Token verification response:", res);

                if (!res.ok) {
                    store.then(store => store.set("token", null));
                    goto("/login");
                }
            } catch (err) {
                console.error("Error verifying token:", err);
                store.then(store => store.set("token", null));
                goto("/login");
            }
        }
    })
</script>

{@render children()}