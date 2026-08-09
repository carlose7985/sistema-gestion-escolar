<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $apiUrl;

    public function __construct()
    {
        // Recuperamos la URL configurada en el archivo .env
        $this->apiUrl = config('services.whatsapp.url', env('WHATSAPP_API_URL', 'http://localhost:3000/api'));
    }

    /**
     * Envia un mensaje de texto plano a través de la API local de Baileys.
     *
     * @param string $phone Número de teléfono con código de país (ej: 584122810548)
     * @param string $message Mensaje a enviar
     * @return array
     */
    public function sendMessage(string $phone, string $message): array
    {
        try {
            // Realizamos la petición POST a nuestra API de Node.js
            $response = Http::timeout(10) // Evita que Laravel se quede congelado si la API de Node está caída
                ->post("{$this->apiUrl}/send", [
                    'phone' => $phone,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Mensaje enviado correctamente.',
                    'data' => $response->json()
                ];
            }

            // Si la API respondió con error (ej: 400 o 503 por desconexión de WhatsApp)
            return [
                'success' => false,
                'error' => $response->json('error') ?? 'Error desconocido en la API de WhatsApp.',
                'status' => $response->status()
            ];
        } catch (\Exception $e) {
            // Registramos el error en los logs de Laravel en caso de fallo crítico de conexión
            Log::error("Fallo de conexión con la API de WhatsApp: " . $e->getMessage());

            return [
                'success' => false,
                'error' => 'No se pudo establecer conexión con el servidor de mensajería local.'
            ];
        }
    }

    /**
     * Obtiene el estado de conexión de la API de Node y el QR si está disponible.
     */
    public function getStatus(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->apiUrl}/status");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'status' => $response->json('status'),
                    'qr' => $response->json('qr')
                ];
            }

            return [
                'success' => false,
                'status' => 'offline',
                'qr' => null
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'status' => 'offline',
                'qr' => null,
                'error' => 'No se pudo conectar con el servidor de la API.'
            ];
        }
    }
}