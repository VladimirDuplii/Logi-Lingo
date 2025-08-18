<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseApiController
{
    /**
     * Реєстрація нового користувача
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors()->toArray(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Initialize user_progress for new user (5 hearts, 0 points)
        \App\Models\UserProgress::firstOrCreate(
            ['user_id' => $user->id],
            ['hearts' => 5, 'points' => 0]
        );

        $data = [
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ];

        return $this->sendResponse($data, 'User registered successfully.', 201);
    }

    /**
     * Вхід користувача
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors()->toArray(), 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->sendError('Unauthorized.', ['error' => 'Invalid credentials'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        $data = [
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ];

        return $this->sendResponse($data, 'User logged in successfully.');
    }

    /**
     * Вихід користувача (видалення токенів)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->sendResponse([], 'User logged out successfully.');
    }

    /**
     * Отримання інформації про поточного користувача
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        return $this->sendResponse($request->user(), 'User profile retrieved successfully.');
    }
}
