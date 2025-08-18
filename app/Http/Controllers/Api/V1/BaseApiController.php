<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BaseApiController extends Controller
{
    /**
     * Повернути успішну відповідь API
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $code
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendResponse($data, $message = 'Success', $code = 200)
    {
        $response = [
            'success' => true,
            'data' => $data,
            'message' => $message,
        ];

        return response()->json($response, $code);
    }

    /**
     * Повернути відповідь з помилкою
     *
     * @param  string  $error
     * @param  array  $errorMessages
     * @param  int  $code
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendError($error, $errorMessages = [], $code = 404)
    {
        $response = [
            'success' => false,
            'message' => $error,
        ];

        if (!empty($errorMessages)) {
            $response['errors'] = $errorMessages;
        }

        return response()->json($response, $code);
    }
}
