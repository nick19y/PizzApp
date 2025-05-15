<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemOrderRequest;
use App\Models\Item;
use App\Models\ItemOrder;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemOrderController extends Controller
{
    /**
     * Display all items in a specific order
     */
    public function index(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        // Check if user is authorized to view this order
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }

        $itemOrders = ItemOrder::with('item')
            ->where('order_id', $order->id) // Use $order->id
            ->get();

        return response()->json([
            'success' => true,
            'data' => $itemOrders
        ]);
    }

    /**
     * Add a new item to an existing order
     */
    public function store(ItemOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        
        $order = Order::findOrFail($data['order_id']);
        
        // Check if user is authorized to modify this order
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }
        
        // Check if order is still pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível modificar um pedido que já está em processamento ou concluído'
            ], 400);
        }
        
        $menuItem = Item::findOrFail($data['item_id']);
        $priceField = 'price_' . $data['size'];
        $price = $menuItem->$priceField;
        
        if (!$price) {
            return response()->json([
                'success' => false,
                'message' => "Tamanho {$data['size']} não disponível para {$menuItem->name}"
            ], 400);
        }
        
        // Create the item order
        $itemOrder = ItemOrder::create([
            'order_id' => $data['order_id'],
            'item_id' => $data['item_id'],
            'size' => $data['size'],
            'quantity' => $data['quantity'],
            'unit_price' => $price,
            'subtotal' => $price * $data['quantity'],
            'special_instructions' => $data['special_instructions'] ?? null
        ]);
        
        // Update order total
        $order->total_amount = $order->total_amount + $itemOrder->subtotal;
        $order->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Item adicionado ao pedido com sucesso',
            'data' => $itemOrder->load('item')
        ], 201);
    }

    /**
     * Update an item in the order
     */
    public function update(Request $request, ItemOrder $itemOrder): JsonResponse
    {
        $user = $request->user();
        $order = $itemOrder->order;
        
        // Check if user is authorized to modify this order
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }
        
        // Check if order is still pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível modificar um pedido que já está em processamento ou concluído'
            ], 400);
        }
        
        $request->validate([
            'size' => 'sometimes|required|in:small,medium,large',
            'quantity' => 'sometimes|required|integer|min:1',
            'special_instructions' => 'nullable|string'
        ]);
        
        // Get original subtotal for later calculation
        $originalSubtotal = $itemOrder->subtotal;
        
        // Update the item size if provided
        if ($request->has('size') && $request->size !== $itemOrder->size) {
            $menuItem = $itemOrder->item;
            $priceField = 'price_' . $request->size;
            $price = $menuItem->$priceField;
            
            if (!$price) {
                return response()->json([
                    'success' => false,
                    'message' => "Tamanho {$request->size} não disponível para {$menuItem->name}"
                ], 400);
            }
            
            $itemOrder->size = $request->size;
            $itemOrder->unit_price = $price;
            $itemOrder->subtotal = $price * ($request->has('quantity') ? $request->quantity : $itemOrder->quantity);
        }
        
        // Update quantity if provided
        if ($request->has('quantity')) {
            $itemOrder->quantity = $request->quantity;
            // If size wasn't updated, recalculate subtotal
            if (!$request->has('size')) {
                $itemOrder->subtotal = $itemOrder->unit_price * $request->quantity;
            }
        }
        
        // Update special instructions if provided
        if ($request->has('special_instructions')) {
            $itemOrder->special_instructions = $request->special_instructions;
        }
        
        $itemOrder->save();
        
        // Update order total
        $order->total_amount = $order->total_amount - $originalSubtotal + $itemOrder->subtotal;
        $order->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Item do pedido atualizado com sucesso',
            'data' => $itemOrder->load('item')
        ]);
    }

    /**
     * Remove an item from the order
     */
    public function destroy(Request $request, ItemOrder $itemOrder): JsonResponse
    {
        $user = $request->user();
        $order = $itemOrder->order;
        
        // Check if user is authorized to modify this order
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }
        
        // Check if order is still pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível modificar um pedido que já está em processamento ou concluído'
            ], 400);
        }
        
        // Check if this is the last item in the order
        $itemCount = ItemOrder::where('order_id', $order->id)->count();
        if ($itemCount <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível remover o último item do pedido. Cancele o pedido inteiro se desejar.'
            ], 400);
        }
        
        // Update order total before removing the item
        $order->total_amount = $order->total_amount - $itemOrder->subtotal;
        $order->save();
        
        // Delete the item
        $itemOrder->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Item removido do pedido com sucesso'
        ]);
    }
    public function show(Request $request, ItemOrder $itemOrder): JsonResponse
    {
        $user = $request->user();
        $order = $itemOrder->order;

        // Check if user is authorized to view this order (and its items)
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $itemOrder->load('item')
        ]);
    }
}