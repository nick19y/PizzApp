<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas protegidas com Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request){
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']); // A rota de logout precisa estar aqui!
    
    // Rotas para o gerenciamento de clientes
    Route::apiResource('clients', ClientController::class);
});

Route::get('/ping', function () {
    return response()->json([
        'message' => 'API funcionando corretamente 🚀',
        'status' => 'ok'
    ]);
});

// Rotas públicas (fora do grupo auth:sanctum)
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);