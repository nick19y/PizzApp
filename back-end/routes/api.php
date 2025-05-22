<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DessertController;
use App\Http\Controllers\DrinkController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\PizzaController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ItemOrderController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas protegidas com Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request){
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Rotas para o gerenciamento de clientes
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('items', ItemController::class);
    Route::apiResource('drinks', DrinkController::class);
    Route::apiResource('desserts', DessertController::class);
    Route::apiResource('pizzas', PizzaController::class);
    Route::apiResource('orders', OrderController::class);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/for-user', [OrderController::class, 'storeForUser']);
    Route::get('/order-items/{orderId}', [ItemOrderController::class, 'getByOrderId']);
    Route::apiResource('item_order', ItemOrderController::class);
    
    // Rotas para gerenciamento de ingredientes
    Route::apiResource('ingredients', IngredientController::class);
    Route::get('/ingredient-categories', [IngredientController::class, 'categories']);
    Route::get('/ingredient-stats', [IngredientController::class, 'stats']);
    
    // Rotas para relatórios
    Route::get('/reports/most-sold-item', [ReportController::class, 'mostSoldItem']);
    Route::get('/reports/sales-stats', [ReportController::class, 'salesStats']);
    Route::get('/reports/sales-by-day', [ReportController::class, 'salesByDay']);
    Route::get('/reports/sales-by-product', [ReportController::class, 'salesByProduct']);
    Route::get('/reports/sales-by-category', [ReportController::class, 'salesByCategory']);
    Route::get('/reports/sales-by-hour', [ReportController::class, 'salesByHour']);
});

// Rotas públicas (fora do grupo auth:sanctum)
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);