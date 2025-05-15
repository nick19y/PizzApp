<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ItemOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'item_id' => 'required|exists:items,id',
            'size' => 'required|in:small,medium,large',
            'quantity' => 'required|integer|min:1',
            'special_instructions' => 'nullable|string',
        ];
    }
}