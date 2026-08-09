<?php

namespace App\Http\Middleware;

use App\Models\EmpleadoActivo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        Carbon::setLocale('es');
        $today = Carbon::today();
        $birthdaysCount = 0;

        // Solo hacemos la consulta si el usuario está logueado para ahorrar recursos
        if ($request->user()) {
            $birthdaysCount = EmpleadoActivo::whereMonth('fecha_de_nacimiento', $today->month)
                ->whereDay('fecha_de_nacimiento', $today->day)
                ->count();
        }
        
        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'info' => fn() => $request->session()->get('info'),
                'warning' => fn() => $request->session()->get('warning'),
                'message' => fn() => $request->session()->get('message'),
                'conflicto' => fn() => $request->session()->get('conflicto'),
                'responsable' => fn() => $request->session()->get('responsable'),
                'result' => fn() => $request->session()->get('result'),
                'estudiante_retirado' => fn() => $request->session()->get('estudiante_retirado'),
                'abrir_modal_periodo' => fn() => $request->session()->get('abrir_modal_periodo'),                
                'alerta_pendientes' => fn() => $request->session()->get('alerta_pendientes'),
                'student_id' => fn() => $request->session()->get('student_id'),
                'student_type' => fn() => $request->session()->get('student_type'),
                'last_scan' => fn() => $request->session()->get('last_scan'),
                'estudiante_retirado_id' => fn() => $request->session()->get('estudiante_retirado_id'),
                'whatsapp_message' => fn() => $request->session()->get('whatsapp_message'),
            ],
            'auth' => [
                'user' => $request->user(),
                // Lógica para saber si ya hay una institución creada
                'has_institution' => \App\Models\Institucion::exists(),
                // Lógica para saber si hay niveles (ajusta según tu BD)
               'has_levels' => \App\Models\Nivel::exists(),
            ],
            'birthdays_count' => $birthdaysCount,
        ];
    }
}
