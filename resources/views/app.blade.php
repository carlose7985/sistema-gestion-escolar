<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <!-- <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" /> -->
    <style>
        @keyframes progress {
            0% {
                width: 100%;
                opacity: 1;
            }

            100% {
                width: 0%;
                opacity: 0.5;
            }
        }

        /* Scrollbar elegante para el dropdown */
        .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 9999px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #a7f3d0;
            border-radius: 9999px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6ee7b7;
        }
    </style>
    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>