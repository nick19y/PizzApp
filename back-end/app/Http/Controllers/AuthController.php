<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function signup(SignupRequest $request)
    {
        $data=$request->validated();
        $user = User::create([
            'name'=>$data["name"],
            'email'=>$data["email"],
            'password'=>$data["password"],
            'address'=>$data["address"],
            'phone'=>$data["phone"],
        ]);
        $token = $user->createToken('main')->plainTextToken;

        return response(compact('user', 'token'));
    }
    public function login(LoginRequest $request)
    {
        $credentials=$request->validated();
        if(!Auth::attempt($credentials)){
            return response([
                'message'=>'Provided email or password is incorrect'
            ]);
        }
        /** @var User $user */
        $user=Auth::user();
        $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }
    public function logout(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
