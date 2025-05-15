<?php

namespace App\Http\Controllers;

use App\Models\Pizza;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PizzaController extends Controller
{
    /**
     * Display a listing of all pizzas
     */
    public function index()
    {
        $pizzas = Item::where('category', 'pizzas')
                      ->with('pizza')
                      ->get();

        return response()->json([
            'data' => $pizzas,
            'message' => 'Pizzas retrieved successfully'
        ]);
    }

    /**
     * Store a newly created pizza
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_small' => 'required|numeric|min:0',
            'price_medium' => 'nullable|numeric|min:0',
            'price_large' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'available' => 'boolean',
            'featured' => 'boolean',
            'estimated_time' => 'nullable|string',
            'ingredients' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create the base item
            $item = Item::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category' => 'pizzas',
                'price_small' => $validated['price_small'],
                'price_medium' => $validated['price_medium'] ?? null,
                'price_large' => $validated['price_large'] ?? null,
                'image' => $validated['image'] ?? null,
                'available' => $validated['available'] ?? true,
                'featured' => $validated['featured'] ?? false,
                'estimated_time' => $validated['estimated_time'] ?? null,
            ]);
            
            // Create the pizza record
            Pizza::create([
                'item_id' => $item->id,
                'ingredients' => $validated['ingredients'] ?? null
            ]);

            DB::commit();
            
            // Load the pizza relationship
            $item->load('pizza');
                       
            return response()->json([
                'data' => $item,
                'message' => 'Pizza created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating pizza',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified pizza
     */
    public function show($id)
    {
        $pizza = Item::where('category', 'pizzas')
                     ->with('pizza')
                     ->findOrFail($id);
        
        return response()->json([
            'data' => $pizza,
            'message' => 'Pizza retrieved successfully'
        ]);
    }

    /**
     * Update the specified pizza
     */
    public function update(Request $request, $id)
    {
        $item = Item::where('category', 'pizzas')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price_small' => 'numeric|min:0',
            'price_medium' => 'nullable|numeric|min:0',
            'price_large' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'available' => 'boolean',
            'featured' => 'boolean',
            'estimated_time' => 'nullable|string',
            'ingredients' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update the base item
            $item->update($validated);
            
            // Update the pizza details
            if (isset($validated['ingredients'])) {
                $item->pizza->update(['ingredients' => $validated['ingredients']]);
            }

            DB::commit();
            
            // Reload the item with pizza relationship
            $item = Item::with('pizza')->find($id);
            
            return response()->json([
                'data' => $item,
                'message' => 'Pizza updated successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating pizza',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified pizza
     */
    public function destroy($id)
    {
        $item = Item::where('category', 'pizzas')->findOrFail($id);
        
        DB::beginTransaction();
        try {
            // When deleting the item, the pizza record will also be deleted due to onDelete('cascade')
            $item->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Pizza deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting pizza',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}