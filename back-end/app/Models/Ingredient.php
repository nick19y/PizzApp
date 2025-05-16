<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array
     */
    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'categoria',
        'preco_compra',
        'preco_venda',
        'quantidade_estoque',
        'estoque_minimo',
        'fornecedor',
        'localizacao',
        'data_ultima_compra',
        'unidade_medida',
        'data_validade',
        'imagem'
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array
     */
    protected $casts = [
        'preco_compra' => 'float',
        'preco_venda' => 'float',
        'quantidade_estoque' => 'float',
        'estoque_minimo' => 'float',
        'data_ultima_compra' => 'date',
        'data_validade' => 'date',
    ];

    /**
     * Verifica se o ingrediente está em estoque baixo
     * 
     * @return bool
     */
    public function isLowStock()
    {
        return $this->quantidade_estoque > 0 && $this->quantidade_estoque < $this->estoque_minimo;
    }

    /**
     * Verifica se o ingrediente está esgotado
     * 
     * @return bool
     */
    public function isOutOfStock()
    {
        return $this->quantidade_estoque <= 0;
    }

    /**
     * Verifica se o ingrediente está próximo do vencimento (7 dias)
     * 
     * @return bool
     */
    public function isNearExpiration()
    {
        $hoje = now();
        $dataValidade = $this->data_validade;
        $umaSemana = now()->addDays(7);
        
        return $dataValidade <= $umaSemana && $dataValidade >= $hoje;
    }

    /**
     * Verifica se o ingrediente está vencido
     * 
     * @return bool
     */
    public function isExpired()
    {
        return $this->data_validade < now();
    }
}