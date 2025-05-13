<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Exemplo de rota pública
Route::post('/signup', function (Request $request) {
    return response()->json(['message' => 'Cadastro recebido!']);
});
