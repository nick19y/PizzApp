<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Models\Item;
use App\Models\ItemOrder;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Admin or staff can see all orders
        if ($user->role === 'admin' || $user->role === 'staff') {
            $orders = Order::with(['user:id,name,email', 'itemOrders.item'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            // Regular users can only see their own orders
            $orders = Order::with(['itemOrders.item'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function storeForUser(OrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        $userId = $data['user_id'];

        // Verifica se o usuário existe
        $user = User::findOrFail($userId);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            foreach ($items as $item) {
                $menuItem = Item::findOrFail($item['item_id']);
                $priceField = 'price_' . $item['size'];
                $price = $menuItem->$priceField;

                if (!$price) {
                    throw new \Exception("Tamanho {$item['size']} não disponível para {$menuItem->name}");
                }

                $totalAmount += $price * $item['quantity'];
            }

            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'delivery_address' => $data['delivery_address'] ?? $user->address,
                'contact_phone' => $data['contact_phone'],
                'notes' => $data['notes'] ?? null,
                'delivery_time' => $data['delivery_time'] ?? null,
                'payment_method' => $data['payment_method'],
                'payment_status' => false
            ]);

            foreach ($items as $item) {
                $menuItem = Item::findOrFail($item['item_id']);
                $priceField = 'price_' . $item['size'];
                $price = $menuItem->$priceField;

                ItemOrder::create([
                    'order_id' => $order->id,
                    'item_id' => $item['item_id'],
                    'size' => $item['size'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $price,
                    'subtotal' => $price * $item['quantity'],
                    'special_instructions' => $item['special_instructions'] ?? null
                ]);
            }

            DB::commit();
            $order->load(['itemOrders.item']);

            return response()->json([
                'success' => true,
                'message' => 'Pedido criado com sucesso para outro usuário',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar o pedido: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Store a newly created order in storage.
     */
    public function store(OrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $items = $data['items'];
        
        try {
            DB::beginTransaction();
            
            // Calculate total amount
            $totalAmount = 0;
            foreach ($items as $item) {
                $menuItem = Item::findOrFail($item['item_id']);
                
                // Get price based on size
                $priceField = 'price_' . $item['size'];
                $price = $menuItem->$priceField;
                
                if (!$price) {
                    throw new \Exception("Tamanho {$item['size']} não disponível para {$menuItem->name}");
                }
                
                $totalAmount += $price * $item['quantity'];
            }
            
            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'delivery_address' => $data['delivery_address'] ?? $user->address,
                'contact_phone' => $data['contact_phone'],
                'notes' => $data['notes'] ?? null,
                'delivery_time' => $data['delivery_time'] ?? null,
                'payment_method' => $data['payment_method'],
                'payment_status' => false
            ]);
            
            // Add items to order
            foreach ($items as $item) {
                $menuItem = Item::findOrFail($item['item_id']);
                $priceField = 'price_' . $item['size'];
                $price = $menuItem->$priceField;
                
                ItemOrder::create([
                    'order_id' => $order->id,
                    'item_id' => $item['item_id'],
                    'size' => $item['size'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $price,
                    'subtotal' => $price * $item['quantity'],
                    'special_instructions' => $item['special_instructions'] ?? null
                ]);
            }
            
            DB::commit();
            
            // Load related data for response
            $order->load(['itemOrders.item']);
            
            return response()->json([
                'success' => true,
                'message' => 'Pedido criado com sucesso',
                'data' => $order
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar o pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        
        // Check if user is authorized to view this order
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }
        
        $order->load(['itemOrders.item', 'user:id,name,email']);
        
        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update the specified order status.
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        
        // Only admin or staff can update orders
        if (!in_array($user->role, ['admin', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }
        
        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,processing,shipped,delivered,canceled',
            'payment_status' => 'sometimes|boolean',
            'delivery_address' => 'sometimes|nullable|string',
            'contact_phone' => 'sometimes|nullable|string|max:20',
            'notes' => 'sometimes|nullable|string',
            'delivery_time' => 'sometimes|nullable|date',
            'payment_method' => 'sometimes|string|in:cash,credit_card,debit_card,pix',
        ]);
        
        $order->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Pedido atualizado com sucesso',
            'data' => $order
        ]);
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();
        
        // Only admin or the order owner can cancel a pending order
        if ($user->id !== $order->user_id && !in_array($user->role, ['admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado'
            ], 403);
        }
        
        // You can only cancel an order if it's still pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível cancelar um pedido que já está em processamento ou concluído'
            ], 400);
        }
        
        $order->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Pedido cancelado com sucesso'
        ]);
    }
}