<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    public function procesarFormulario(string $imagenPath): ?string
    {
        $apiKey = config('services.gemini.key');
        // Usamos el modelo más actual que aparece en tu lista
        $model = "gemini-3.5-flash";
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
        // Leer y convertir imagen
        $imageData = base64_encode(file_get_contents($imagenPath));

        $prompt = 'Extrae los datos de esta ficha escolar. Devuelve EXCLUSIVAMENTE un objeto JSON sin formato markdown (sin ```json). 
        Usa estrictamente estas claves: nombres_completos, apellidos_completos, cedula, sexo, fecha_de_nacimiento, 
        lugar_de_nacimiento, entidad_federal, direccion, apreciacion, condicion, instituto_de_procedencia, 
        status_escolar, lateralidad, dificultades, alergias, enfermedades_padecidas, tratamiento_medico, 
        talla_de_camisa, talla_de_pantalon, talla_de_zapato, condicion_especial, etnia. si extaes apreciacion y la ves separada ejemplo B - 18, debes ponerla pegadas "B-18",
        Si el campo está vacío o no se detecta marca, pon "null".';

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                "contents" => [[
                    "parts" => [
                        ["text" => $prompt],
                        ["inline_data" => ["mime_type" => "image/jpeg", "data" => $imageData]]
                    ]
                ]]
            ]);

        if ($response->successful()) {
            return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? null;
        }

        Log::error('Error en API Gemini: ' . $response->body());
        return null;
    }

    public function procesarAsistencia(string $imagenPath, string $fechaObjetivo)
    {
        $apiKey = config('services.gemini.key');
        // Usamos el modelo especificado
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={$apiKey}";

        $imageData = base64_encode(file_get_contents($imagenPath));

        $prompt = "Analiza la imagen de la planilla. 
          1. Primero, busca si en la parte superior existe explícitamente el texto '{$fechaObjetivo}'.
          2. SI NO EXISTE la fecha en la imagen, responde EXCLUSIVAMENTE la palabra: 'SIN_DATOS'.
          3. SI EXISTE, extrae los datos de asistencia en un JSON puro con este formato: { \"grados\": [ {\"grado\": \"1er Grado A\", \"V\": 0, \"H\": 0}, ... ] }.
           No incluyas explicaciones adicionales.";
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                "contents" => [[
                    "parts" => [
                        ["text" => $prompt],
                        ["inline_data" => ["mime_type" => "image/jpeg", "data" => $imageData]]
                    ]
                ]]
            ]);

        if (!$response->successful()) {
            Log::error('Error en API Gemini: ' . $response->body());
            return null;
        }

        return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

   
}
