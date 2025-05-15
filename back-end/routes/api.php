<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DessertController;
use App\Http\Controllers\DrinkController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\PizzaController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ItemOrderController;
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
    Route::apiResource('items', ItemController::class);
    Route::apiResource('drinks', DrinkController::class);
    Route::apiResource('desserts', DessertController::class);
    Route::apiResource('pizzas', PizzaController::class);
    Route::apiResource('orders', OrderController::class);
    Route::post('/orders/for-user', [OrderController::class, 'storeForUser']);
    Route::apiResource('item_order', ItemOrderController::class);
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