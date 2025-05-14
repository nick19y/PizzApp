<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function signup(SignupRequest $request)
    {
        try {
            $data = $request->validated();
            
            // Verificar se todos os campos necessários estão presentes
            if (!isset($data["address"])) {
                $data["address"] = null;
            }
            
            if (!isset($data["phone"])) {
                $data["phone"] = null;
            }
            
            // Verificar se o email já existe
            if (User::where('email', $data["email"])->exists()) {
                return response()->json([
                    'message' => 'Este email já está sendo utilizado por outro usuário.',
                    'errors' => [
                        'email' => ['Este email já está cadastrado no sistema.']
                    ]
                ], 422);
            }
            
            $user = User::create([
                'name' => $data["name"],
                'email' => $data["email"],
                'password' => bcrypt($data["password"]), // Importante: usar bcrypt para criptografar a senha
                'address' => $data["address"],
                'phone' => $data["phone"],
                'role' => $data["role"],
            ]);
            
            // Criar o token
            $token = $user->createToken('main')->plainTextToken;
            
            // Retornar resposta simples sem serialização completa do usuário
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'address' => $user->address,
                    'phone' => $user->phone,
                    'role' => $user->role,
                ],
                'token' => $token
            ], 201);
        } catch (\Exception $e) {
            // Log do erro para depuração
            Log::error('Erro durante o cadastro: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao cadastrar usuário: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }
    
    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();
            
            if(!Auth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Email ou senha incorretos'
                ], 422);
            }
            
            /** @var User $user */
            $user = Auth::user();
            $token = $user->createToken('main')->plainTextToken;
            
            // Remover dados sensíveis
            $user = $user->makeHidden(['created_at', 'updated_at', 'email_verified_at']);
            
            // Log para depuração
            Log::info('Login bem-sucedido', ['user_id' => $user->id]);
            
            return response()->json([
                'user' => $user,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            // Log do erro para depuração
            Log::error('Erro durante o login: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'message' => 'Erro ao fazer login',
                'error' => 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.'
            ], 500);
        }
    }
    
    public function logout(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}