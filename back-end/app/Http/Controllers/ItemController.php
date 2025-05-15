<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Pizza;
use App\Models\Drink;
use App\Models\Dessert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ItemController extends Controller
{
    /**
     * Returns all menu items, optionally filtered by category
     */
    public function index(Request $request)
    {
        $query = Item::query();
        
        // Apply category filter if provided
        if ($request->has('category')) {
            $category = $request->category;
            $query->where('category', $category);
        }
        
        // Apply search filter if provided
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Apply availability filter
        if ($request->has('available')) {
            $available = filter_var($request->available, FILTER_VALIDATE_BOOLEAN);
            $query->where('available', $available);
        }
        
        // Filter by featured items
        if ($request->has('featured')) {
            $featured = filter_var($request->featured, FILTER_VALIDATE_BOOLEAN);
            $query->where('featured', $featured);
        }
        
        $items = $query->get();
        
        // Load specific details for each item
        $items->each(function ($item) {
            $item->specific_details = $item->getSpecificDetails();
        });

        return response()->json([
            'data' => $items,
            'message' => 'Items retrieved successfully'
        ]);
    }

    /**
     * Stores a new menu item
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => ['required', Rule::in(['pizzas', 'drinks', 'desserts'])],
            'price_small' => 'required|numeric|min:0',
            'price_medium' => 'nullable|numeric|min:0',
            'price_large' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'available' => 'boolean',
            'featured' => 'boolean',
            'estimated_time' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create the base item
            $item = Item::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'],
                'price_small' => $validated['price_small'],
                'price_medium' => $validated['price_medium'] ?? null,
                'price_large' => $validated['price_large'] ?? null,
                'image' => $validated['image'] ?? null,
                'available' => $validated['available'] ?? true,
                'featured' => $validated['featured'] ?? false,
                'estimated_time' => $validated['estimated_time'] ?? null,
            ]);
            
            // Create the corresponding record in the specific table
            switch ($validated['category']) {
                case 'pizzas':
                    Pizza::create([
                        'item_id' => $item->id,
                        'ingredients' => $validated['ingredients'] ?? null
                    ]);
                    break;
                case 'drinks':
                    Drink::create([
                        'item_id' => $item->id,
                        'type' => $validated['type'] ?? null
                    ]);
                    break;
                case 'desserts':
                    Dessert::create([
                        'item_id' => $item->id,
                        'ingredients' => $validated['ingredients'] ?? null
                    ]);
                    break;
            }

            DB::commit();
            
            // Load the specific relationship
            $item->load($validated['category'] === 'pizzas' ? 'pizza' : 
                       ($validated['category'] === 'drinks' ? 'drink' : 'dessert'));
                       
            return response()->json([
                'data' => $item,
                'message' => 'Item created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific menu item
     */
    public function show($id)
    {
        $item = Item::with(['pizza', 'drink', 'dessert'])->findOrFail($id);
        
        return response()->json([
            'data' => $item,
            'message' => 'Item retrieved successfully'
        ]);
    }

    /**
     * Update a specific menu item
     */
    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'category' => [Rule::in(['pizzas', 'drinks', 'desserts'])],
            'price_small' => 'numeric|min:0',
            'price_medium' => 'nullable|numeric|min:0',
            'price_large' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'available' => 'boolean',
            'featured' => 'boolean',
            'estimated_time' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update the base item
            $item->update($validated);
            
            // If the category hasn't changed, just update the specific data
            if (!isset($validated['category']) || $validated['category'] === $item->category) {
                switch ($item->category) {
                    case 'pizzas':
                        if (isset($validated['ingredients'])) {
                            $item->pizza->update(['ingredients' => $validated['ingredients']]);
                        }
                        break;
                    case 'drinks':
                        if (isset($validated['type'])) {
                            $item->drink->update(['type' => $validated['type']]);
                        }
                        break;
                    case 'desserts':
                        if (isset($validated['ingredients'])) {
                            $item->dessert->update(['ingredients' => $validated['ingredients']]);
                        }
                        break;
                }
            } 
            // If the category has changed, we need to delete the old record and create a new one
            else {
                // Delete the old specific record
                switch ($item->category) {
                    case 'pizzas':
                        $item->pizza()->delete();
                        break;
                    case 'drinks':
                        $item->drink()->delete();
                        break;
                    case 'desserts':
                        $item->dessert()->delete();
                        break;
                }
                
                // Create the new specific record
                switch ($validated['category']) {
                    case 'pizzas':
                        Pizza::create([
                            'item_id' => $item->id,
                            'ingredients' => $validated['ingredients'] ?? null
                        ]);
                        break;
                    case 'drinks':
                        Drink::create([
                            'item_id' => $item->id,
                            'type' => $validated['type'] ?? null
                        ]);
                        break;
                    case 'desserts':
                        Dessert::create([
                            'item_id' => $item->id,
                            'ingredients' => $validated['ingredients'] ?? null
                        ]);
                        break;
                }
            }

            DB::commit();
            
            // Reload the item with relationships
            $item = Item::with(['pizza', 'drink', 'dessert'])->find($id);
            
            return response()->json([
                'data' => $item,
                'message' => 'Item updated successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a specific menu item
     */
    public function destroy($id)
    {
        $item = Item::findOrFail($id);
        
        DB::beginTransaction();
        try {
            // The relationship is configured with onDelete('cascade'),
            // so when deleting the item, the specific record will also be deleted
            $item->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Item deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * List items by category
     */
    public function listByCategory($category)
    {
        $categories = ['pizzas', 'drinks', 'desserts'];
        
        if (!in_array($category, $categories)) {
            return response()->json([
                'message' => 'Invalid category'
            ], 400);
        }
        
        $items = Item::where('category', $category)
                     ->where('available', true)
                     ->get();
        
        // Load specific relationship
        switch ($category) {
            case 'pizzas':
                $items->load('pizza');
                break;
            case 'drinks':
                $items->load('drink');
                break;
            case 'desserts':
                $items->load('dessert');
                break;
        }
        
        return response()->json([
            'data' => $items,
            'message' => 'Items retrieved successfully'
        ]);
    }
    
    /**
     * List featured items
     */
    public function featured()
    {
        $items = Item::where('featured', true)
                     ->where('available', true)
                     ->get();
        
        // Load specific details for each item
        $items->each(function ($item) {
            $item->specific_details = $item->getSpecificDetails();
        });
        
        return response()->json([
            'data' => $items,
            'message' => 'Featured items retrieved successfully'
        ]);
    }
}