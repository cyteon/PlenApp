<script lang="ts">
    import { goto } from "$app/navigation";
    import store from "../../lib/store";

    let email = "";
    let password = "";
    let error = "";

    async function login() {
        error = "";

        if (!email || !password) {
            error = "Email and password are required";
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/app/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                error = data.error || "Login failed";
                return;
            }

            const data = await res.json();
            
            store.then(store => {
                store.set("token", data.token);
            });

            goto("/");
        } catch (err) {
            error = err.message;
        }
    }

    async function register() {
        error = "";

        if (!email || !password) {
            error = "email and password are required";
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/app/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                error = data.error || "Registration failed";
                return;
            }

            const data = await res.json();
            
            store.then(store => {
                store.set("token", data.token);
            });

            goto("/");
        } catch (err) {
            error = err.message;
        }
    }
</script>

<div class="flex h-full">
    <h1 class="absolute top-18 left-0 text-3xl font-bold w-full text-center">
        Plen - Flight Tracking
    </h1>

    <div class="my-auto w-full">
        <input 
            type="text" 
            placeholder="Enter email" 
            class="w-full p-2 mb-2 border rounded-md text-xl" 
            bind:value={email} 
        />

        <input 
            type="password" 
            placeholder="Enter password" 
            class="w-full p-2 mb-2 border rounded-md text-xl" 
            bind:value={password} 
        />

        {#if error}
            <div class="text-ctp-red mb-2">
                {error}
            </div>
        {/if}

        <div class="flex">
            <button 
                class="w-full p-2 rounded-md border text-xl" 
                on:click={login}
            >
                Login
            </button>
            <button 
                class="w-full p-2 ml-2 rounded-md border text-xl" 
                on:click={register}
            >
                Register
            </button>
        </div>
    </div>
</div>