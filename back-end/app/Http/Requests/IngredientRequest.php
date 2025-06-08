<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IngredientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Com Sanctum, a autenticação já é verificada nas rotas
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Mapear nomes de campos do frontend para backend quando necessário
        $mapped = [];
        
        if ($this->has('precoCompra')) {
            $mapped['preco_compra'] = $this->precoCompra;
        }
        
        if ($this->has('precoVenda')) {
            $mapped['preco_venda'] = $this->precoVenda;
        }
        
        if ($this->has('quantidadeEstoque')) {
            $mapped['quantidade_estoque'] = $this->quantidadeEstoque;
        }
        
        if ($this->has('estoqueMinimo')) {
            $mapped['estoque_minimo'] = $this->estoqueMinimo;
        }
        
        if ($this->has('dataUltimaCompra')) {
            $mapped['data_ultima_compra'] = $this->dataUltimaCompra;
        }
        
        if ($this->has('unidadeMedida')) {
            $mapped['unidade_medida'] = $this->unidadeMedida;
        }
        
        if ($this->has('dataValidade')) {
            $mapped['data_validade'] = $this->dataValidade;
        }
        
        if (!empty($mapped)) {
            $this->merge($mapped);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'categoria' => 'required|string|max:255',
            'preco_compra' => 'required|numeric|min:0',
            'preco_venda' => 'nullable|numeric|min:0',
            'quantidade_estoque' => 'required|numeric|min:0',
            'estoque_minimo' => 'required|numeric|min:0',
            'fornecedor' => 'required|string|max:255',
            'localizacao' => 'nullable|string|max:255',
            'data_ultima_compra' => 'nullable|date',
            'unidade_medida' => 'required|string|max:50',
            'data_validade' => 'required|date',
            'imagem' => 'nullable|string|max:255',
        ];

        // Para atualização, o código pode ser o mesmo. Para criação, pode ser vazio ou único
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['codigo'] = ['nullable', 'string', 'max:20', Rule::unique('ingredients')->ignore($this->route('ingredient')->id)];
        } else {
            $rules['codigo'] = 'nullable|string|max:20|unique:ingredients'; // ← Mudança aqui
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'codigo.required' => 'O código do ingrediente é obrigatório',
            'codigo.unique' => 'Este código já está em uso',
            'nome.required' => 'O nome do ingrediente é obrigatório',
            'categoria.required' => 'A categoria é obrigatória',
            'preco_compra.required' => 'O preço de compra é obrigatório',
            'preco_compra.numeric' => 'O preço de compra deve ser um valor numérico',
            'quantidade_estoque.required' => 'A quantidade em estoque é obrigatória',
            'quantidade_estoque.numeric' => 'A quantidade em estoque deve ser um valor numérico',
            'estoque_minimo.required' => 'O estoque mínimo é obrigatório',
            'estoque_minimo.numeric' => 'O estoque mínimo deve ser um valor numérico',
            'fornecedor.required' => 'O fornecedor é obrigatório',
            'unidade_medida.required' => 'A unidade de medida é obrigatória',
            'data_validade.required' => 'A data de validade é obrigatória',
            'data_validade.date' => 'A data de validade deve ser uma data válida',
        ];
    }
}