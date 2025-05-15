<?php

namespace App\Http\Controllers;

use App\Models\Dessert;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DessertController extends Controller
{
    /**
     * Display a listing of all desserts
     */
    public function index()
    {
        $desserts = Item::where('category', 'desserts')
                        ->with('dessert')
                        ->get();

        return response()->json([
            'data' => $desserts,
            'message' => 'Desserts retrieved successfully'
        ]);
    }

    /**
     * Store a newly created dessert
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
            'flavor' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $item = Item::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category' => 'desserts',
                'price_small' => $validated['price_small'],
                'price_medium' => $validated['price_medium'] ?? null,
                'price_large' => $validated['price_large'] ?? null,
                'image' => $validated['image'] ?? null,
                'available' => $validated['available'] ?? true,
                'featured' => $validated['featured'] ?? false,
                'estimated_time' => $validated['estimated_time'] ?? null,
            ]);

            Dessert::create([
                'item_id' => $item->id,
                'flavor' => $validated['flavor'] ?? null
            ]);

            DB::commit();

            $item->load('dessert');

            return response()->json([
                'data' => $item,
                'message' => 'Dessert created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating dessert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified dessert
     */
    public function show($id)
    {
        $dessert = Item::where('category', 'desserts')
                       ->with('dessert')
                       ->findOrFail($id);

        return response()->json([
            'data' => $dessert,
            'message' => 'Dessert retrieved successfully'
        ]);
    }

    /**
     * Update the specified dessert
     */
    public function update(Request $request, $id)
    {
        $item = Item::where('category', 'desserts')->findOrFail($id);

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
            'flavor' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $item->update($validated);

            if (isset($validated['flavor'])) {
                $item->dessert->update(['flavor' => $validated['flavor']]);
            }

            DB::commit();

            $item = Item::with('dessert')->find($id);

            return response()->json([
                'data' => $item,
                'message' => 'Dessert updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating dessert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified dessert
     */
    public function destroy($id)
    {
        $item = Item::where('category', 'desserts')->findOrFail($id);

        DB::beginTransaction();
        try {
            $item->delete();

            DB::commit();

            return response()->json([
                'message' => 'Dessert deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting dessert',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
