<?php

namespace App\Http\Controllers;

use App\Http\Requests\IngredientRequest;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IngredientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ingredient::query();
        
        // Filtrar por termo de busca
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('nome', 'like', "%{$search}%")
                  ->orWhere('fornecedor', 'like', "%{$search}%");
            });
        }
        
        // Filtrar por categoria
        if ($request->has('categoria') && $request->categoria !== 'todas' && $request->categoria !== null) {
            $query->where('categoria', $request->categoria);
        }
        
        // Outros filtros possíveis
        if ($request->has('estoque_baixo') && $request->estoque_baixo) {
            $query->whereRaw('quantidade_estoque > 0 AND quantidade_estoque < estoque_minimo');
        }
        
        if ($request->has('esgotados') && $request->esgotados) {
            $query->where('quantidade_estoque', '<=', 0);
        }
        
        if ($request->has('vencendo') && $request->vencendo) {
            $hoje = now();
            $umaSemanaDepois = now()->addDays(7);
            $query->whereBetween('data_validade', [$hoje, $umaSemanaDepois]);
        }
        
        $perPage = $request->input('per_page', 15);
        
        // Verificar se é solicitado todos os registros
        if ($perPage === 'all') {
            $ingredients = $query->orderBy('id', 'desc')->get();
            return response()->json(['data' => $ingredients]);
        } else {
            $ingredients = $query->orderBy('id', 'desc')->paginate($perPage);
            return response()->json($ingredients);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(IngredientRequest $request)
    {
        $validatedData = $request->validated();
        
        // Ajustar nomes dos campos para o backend
        $backendData = $this->convertToBackendFormat($validatedData);
        
        // Se não for fornecido um código, gerar um automaticamente
        if (empty($backendData['codigo'])) {
            $lastId = Ingredient::max('id') ?? 0;
            $backendData['codigo'] = 'ING' . str_pad($lastId + 1, 3, '0', STR_PAD_LEFT);
        }
        
        // Se não for fornecida uma imagem, usar placeholder
        if (empty($backendData['imagem'])) {
            $backendData['imagem'] = '/api/placeholder/80/80';
        }
        
        $ingredient = Ingredient::create($backendData);
        
        return response()->json([
            'message' => 'Ingrediente cadastrado com sucesso!',
            'data' => $ingredient
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Ingredient $ingredient)
    {
        return response()->json([
            'data' => $ingredient
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(IngredientRequest $request, Ingredient $ingredient)
    {
        $validatedData = $request->validated();
        
        // Ajustar nomes dos campos para o backend
        $backendData = $this->convertToBackendFormat($validatedData);
        
        $ingredient->update($backendData);
        
        return response()->json([
            'message' => 'Ingrediente atualizado com sucesso!',
            'data' => $ingredient
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ingredient $ingredient)
    {
        $ingredient->delete();
        
        return response()->json([
            'message' => 'Ingrediente excluído com sucesso!'
        ]);
    }

    /**
     * Retorna as categorias únicas de ingredientes.
     */
    public function categories()
    {
        $categories = Ingredient::select('categoria')
                              ->distinct()
                              ->orderBy('categoria')
                              ->pluck('categoria');
        
        return response()->json($categories);
    }

    /**
     * Retorna estatísticas do estoque.
     */
    public function stats(Request $request)
    {
        // Construir consulta base com os mesmos filtros da listagem
        $query = Ingredient::query();
        
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                ->orWhere('nome', 'like', "%{$search}%")
                ->orWhere('fornecedor', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('categoria') && $request->categoria !== 'todas' && $request->categoria !== null) {
            $query->where('categoria', $request->categoria);
        }
        
        // Aplicar as contagens e cálculos
        $totalIngredients = $query->count();
        $valorTotal = (float) $query->sum(DB::raw('preco_compra * quantidade_estoque')); // Converter para float
        
        // Para as demais contagens, precisamos criar novas consultas baseadas na original
        $queryBaixoEstoque = clone $query;
        $queryEsgotados = clone $query;
        $queryVencendo = clone $query;
        
        $baixoEstoque = $queryBaixoEstoque->whereRaw('quantidade_estoque > 0 AND quantidade_estoque < estoque_minimo')->count();
        $esgotados = $queryEsgotados->where('quantidade_estoque', '<=', 0)->count();
        
        $hoje = now();
        $umaSemanaDepois = now()->addDays(7);
        $vencendo = $queryVencendo->whereBetween('data_validade', [$hoje, $umaSemanaDepois])->count();
        
        return response()->json([
            'total_ingredientes' => (int) $totalIngredients,
            'valor_total_estoque' => (float) $valorTotal, // Garantir que seja um número
            'baixo_estoque' => (int) $baixoEstoque,
            'esgotados' => (int) $esgotados,
            'vencendo' => (int) $vencendo
        ]);
    }
    
    /**
     * Converte os nomes dos campos do formato do frontend para o backend
     */
    private function convertToBackendFormat($data)
    {
        $mappings = [
            'precoCompra' => 'preco_compra',
            'precoVenda' => 'preco_venda',
            'quantidadeEstoque' => 'quantidade_estoque',
            'estoqueMinimo' => 'estoque_minimo',
            'dataUltimaCompra' => 'data_ultima_compra',
            'unidadeMedida' => 'unidade_medida',
            'dataValidade' => 'data_validade',
        ];
        
        $result = [];
        
        foreach ($data as $key => $value) {
            $newKey = array_key_exists($key, $mappings) ? $mappings[$key] : $key;
            $result[$newKey] = $value;
        }
        
        return $result;
    }
}