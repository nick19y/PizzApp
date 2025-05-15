<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'delivery_address' => 'nullable|string',
            'contact_phone' => 'required|string|max:20',
            'notes' => 'nullable|string',
            'delivery_time' => 'nullable|date',
            'payment_method' => 'required|string|in:cash,credit_card,debit_card,pix',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.size' => 'required|in:small,medium,large',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Você deve adicionar pelo menos um item ao pedido',
            'items.min' => 'Você deve adicionar pelo menos um item ao pedido',
            'items.*.item_id.exists' => 'Um dos itens selecionados não existe',
            'items.*.quantity.min' => 'A quantidade deve ser pelo menos 1',
        ];
    }
}