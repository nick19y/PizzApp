<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index()
    {
        // Recuperar apenas usuários com o role 'client'
        $clients = User::where('role', 'client')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $clients
        ]);
    }

    /**
     * Store a newly created client in storage.
     */
    public function store(Request $request)
    {
        // Validar os dados do request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
        ]);
        
        // Criar um novo cliente
        $client = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => 'client', // Definir o role como 'client'
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Cliente cadastrado com sucesso',
            'data' => $client
        ], 201);
    }

    /**
     * Display the specified client.
     */
    public function show(string $id)
    {
        $client = User::where('role', 'client')->findOrFail($id);
        
        return response()->json([
            'status' => 'success',
            'data' => $client
        ]);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(Request $request, string $id)
    {
        $client = User::where('role', 'client')->findOrFail($id);
        
        // Validar os dados do request
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($client->id),
            ],
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'password' => 'sometimes|nullable|string|min:8',
        ]);
        
        // Atualiza os dados do cliente
        if (isset($validated['name'])) {
            $client->name = $validated['name'];
        }
        
        if (isset($validated['email'])) {
            $client->email = $validated['email'];
        }
        
        if (isset($validated['phone'])) {
            $client->phone = $validated['phone'];
        }
        
        if (isset($validated['address'])) {
            $client->address = $validated['address'];
        }
        
        // Atualizar senha se fornecida
        if (isset($validated['password']) && $validated['password']) {
            $client->password = Hash::make($validated['password']);
        }
        
        $client->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Cliente atualizado com sucesso',
            'data' => $client
        ]);
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(string $id)
    {
        $client = User::where('role', 'client')->findOrFail($id);
        $client->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Cliente excluído com sucesso'
        ]);
    }
}