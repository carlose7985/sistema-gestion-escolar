<?php

namespace App\Providers;

use App\View\Composers\DirectorComposer;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */

    
    public function boot(): void
    {

        View::composer('*', DirectorComposer::class);
        Vite::prefetch(concurrency: 3);
        
    }

    

}
