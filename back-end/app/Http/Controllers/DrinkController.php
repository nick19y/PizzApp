<?php

namespace App\Http\Controllers;

use App\Models\Drink;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DrinkController extends Controller
{
    public function index()
    {
        $drinks = Item::where('category', 'drinks')
                      ->with('drink')
                      ->get();

        return response()->json([
            'data' => $drinks,
            'message' => 'Drinks retrieved successfully'
        ]);
    }

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
            'volume_ml' => 'required|integer|min:0', // específico de drinks
        ]);

        DB::beginTransaction();
        try {
            $item = Item::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category' => 'drinks',
                'price_small' => $validated['price_small'],
                'price_medium' => $validated['price_medium'] ?? null,
                'price_large' => $validated['price_large'] ?? null,
                'image' => $validated['image'] ?? null,
                'available' => $validated['available'] ?? true,
                'featured' => $validated['featured'] ?? false,
                'estimated_time' => $validated['estimated_time'] ?? null,
            ]);

            Drink::create([
                'item_id' => $item->id,
                'volume_ml' => $validated['volume_ml']
            ]);

            DB::commit();

            $item->load('drink');

            return response()->json([
                'data' => $item,
                'message' => 'Drink created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating drink',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $drink = Item::where('category', 'drinks')
                     ->with('drink')
                     ->findOrFail($id);

        return response()->json([
            'data' => $drink,
            'message' => 'Drink retrieved successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = Item::where('category', 'drinks')->findOrFail($id);

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
            'volume_ml' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $item->update($validated);

            if (isset($validated['volume_ml'])) {
                $item->drink->update(['volume_ml' => $validated['volume_ml']]);
            }

            DB::commit();

            $item = Item::with('drink')->find($id);

            return response()->json([
                'data' => $item,
                'message' => 'Drink updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating drink',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $item = Item::where('category', 'drinks')->findOrFail($id);

        DB::beginTransaction();
        try {
            $item->delete();

            DB::commit();

            return response()->json([
                'message' => 'Drink deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting drink',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
