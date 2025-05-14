<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Rota protegida com Sanctum
Route::middleware('auth:sanctum')->get('/user', function (Request $request){
    return $request->user();
});

Route::get('/ping', function () {
    return response()->json([
        'message' => 'API funcionando corretamente 🚀',
        'status' => 'ok'
    ]);
});


Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
