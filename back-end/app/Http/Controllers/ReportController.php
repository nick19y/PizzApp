<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Retorna o item mais vendido com base no período especificado
     */
    public function mostSoldItem(Request $request)
    {
        // Definir período padrão (última semana) se não especificado
        $startDate = $request->input('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Query para encontrar o item mais vendido, agrupando por item_id e somando as quantidades
        $mostSoldItem = ItemOrder::select(
                'item_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(subtotal) as total_value')
            )
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('item_id')
            ->orderByDesc('total_quantity')
            ->with('item')
            ->first();
        
        if (!$mostSoldItem) {
            return response()->json([
                'data' => null,
                'message' => 'Nenhum item vendido no período especificado'
            ]);
        }
        
        return response()->json([
            'data' => [
                'item' => $mostSoldItem->item,
                'quantity' => $mostSoldItem->total_quantity,
                'total_value' => $mostSoldItem->total_value
            ],
            'message' => 'Item mais vendido recuperado com sucesso'
        ]);
    }
    
    /**
     * Retorna estatísticas de vendas por período
     */
    public function salesStats(Request $request)
    {
        // Definir período padrão (última semana) se não especificado
        $startDate = $request->input('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Período anterior (para comparação)
        $daysDiff = now()->parse($endDate)->diffInDays(now()->parse($startDate));
        $previousStartDate = now()->parse($startDate)->subDays($daysDiff)->toDateString();
        $previousEndDate = now()->parse($startDate)->subDays(1)->toDateString();
        
        // Obter vendas do período atual
        $currentPeriodStats = $this->getPeriodStats($startDate, $endDate);
        
        // Obter vendas do período anterior
        $previousPeriodStats = $this->getPeriodStats($previousStartDate, $previousEndDate);
        
        // Calcular percentuais de crescimento
        $salesGrowth = $previousPeriodStats['total_sales'] > 0 
            ? (($currentPeriodStats['total_sales'] - $previousPeriodStats['total_sales']) / $previousPeriodStats['total_sales']) * 100 
            : 0;
            
        $ordersGrowth = $previousPeriodStats['total_orders'] > 0 
            ? (($currentPeriodStats['total_orders'] - $previousPeriodStats['total_orders']) / $previousPeriodStats['total_orders']) * 100 
            : 0;
            
        $ticketGrowth = $previousPeriodStats['average_ticket'] > 0 
            ? (($currentPeriodStats['average_ticket'] - $previousPeriodStats['average_ticket']) / $previousPeriodStats['average_ticket']) * 100 
            : 0;
        
        return response()->json([
            'data' => [
                'current_period' => $currentPeriodStats,
                'previous_period' => $previousPeriodStats,
                'growth' => [
                    'sales_growth' => round($salesGrowth, 1),
                    'orders_growth' => round($ordersGrowth, 1),
                    'ticket_growth' => round($ticketGrowth, 1)
                ]
            ],
            'message' => 'Estatísticas de vendas recuperadas com sucesso'
        ]);
    }
    
    /**
     * Retorna estatísticas de um período específico
     */
    private function getPeriodStats($startDate, $endDate)
    {
        // Filtrar pedidos completos ou entregues
        $completedStatuses = ['completed', 'delivered'];
        
        // Total de vendas
        $totalSales = DB::table('orders')
            ->whereIn('status', $completedStatuses)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('total_amount');
        
        // Total de pedidos
        $totalOrders = DB::table('orders')
            ->whereIn('status', $completedStatuses)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->count();
        
        // Ticket médio
        $averageTicket = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        
        return [
            'total_sales' => (float) $totalSales,
            'total_orders' => (int) $totalOrders,
            'average_ticket' => (float) $averageTicket
        ];
    }
    
    /**
     * Retorna dados para o gráfico de vendas por dia
     */
    public function salesByDay(Request $request)
    {
        // Definir período padrão (última semana) se não especificado
        $startDate = $request->input('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Filtrar pedidos completos ou entregues
        $completedStatuses = ['completed', 'delivered'];
        
        // Obter vendas agrupadas por dia
        $salesByDay = DB::table('orders')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('DAYNAME(created_at) as day_name'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->whereIn('status', $completedStatuses)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('date', 'day_name')
            ->orderBy('date')
            ->get();
        
        // Formatar os dados para o gráfico
        $formattedData = $salesByDay->map(function ($item) {
            return [
                'name' => $this->translateDayName($item->day_name),
                'vendas' => (float) $item->total_sales,
                'pedidos' => (int) $item->orders_count,
                'date' => $item->date
            ];
        });
        
        return response()->json([
            'data' => $formattedData,
            'message' => 'Dados de vendas por dia recuperados com sucesso'
        ]);
    }
    
    /**
     * Retorna dados para o gráfico de vendas por produto
     */
    public function salesByProduct(Request $request)
    {
        // Definir período padrão (última semana) se não especificado
        $startDate = $request->input('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Obter vendas agrupadas por produto
        $salesByProduct = DB::table('item_orders')
            ->join('items', 'item_orders.item_id', '=', 'items.id')
            ->select(
                'items.id',
                'items.name',
                DB::raw('SUM(item_orders.quantity) as total_quantity'),
                DB::raw('SUM(item_orders.subtotal) as total_value')
            )
            ->whereBetween('item_orders.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('items.id', 'items.name')
            ->orderByDesc('total_value')
            ->limit(10)
            ->get();
        
        // Formatar os dados para o gráfico
        $formattedData = $salesByProduct->map(function ($item) {
            return [
                'name' => $item->name,
                'valor' => (float) $item->total_value,
                'quantidade' => (int) $item->total_quantity
            ];
        });
        
        return response()->json([
            'data' => $formattedData,
            'message' => 'Dados de vendas por produto recuperados com sucesso'
        ]);
    }
    
    /**
     * Retorna dados para o gráfico de vendas por categoria
     */
    public function salesByCategory(Request $request)
    {
        // Definir período padrão (última semana) se não especificado
        $startDate = $request->input('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Obter vendas agrupadas por categoria
        $salesByCategory = DB::table('item_orders')
            ->join('items', 'item_orders.item_id', '=', 'items.id')
            ->select(
                'items.category',
                DB::raw('SUM(item_orders.quantity) as total_quantity'),
                DB::raw('SUM(item_orders.subtotal) as total_value')
            )
            ->whereBetween('item_orders.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->groupBy('items.category')
            ->orderByDesc('total_value')
            ->get();
        
        // Formatar os dados para o gráfico
        $formattedData = $salesByCategory->map(function ($item) {
            return [
                'name' => $this->translateCategory($item->category),
                'valor' => (float) $item->total_value,
                'quantidade' => (int) $item->total_quantity
            ];
        });
        
        return response()->json([
            'data' => $formattedData,
            'message' => 'Dados de vendas por categoria recuperados com sucesso'
        ]);
    }
    
    /**
     * Retorna dados para o gráfico de vendas por horário
     */
    public function salesByHour(Request $request)
    {
        // Definir período padrão (última semana) se não especificado
        $startDate = $request->input('start_date', now()->subDays(7)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());
        
        // Obter vendas agrupadas por hora
        $salesByHour = DB::table('orders')
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(total_amount) as total_sales')
            )
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->whereIn('status', ['completed', 'delivered'])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
        
        // Formatar os dados para o gráfico (garantindo todas as horas de operação)
        $formattedData = [];
        foreach (range(10, 23) as $hour) {
            $hourData = $salesByHour->firstWhere('hour', $hour);
            
            $formattedData[] = [
                'name' => $hour . ':00',
                'pedidos' => $hourData ? (int) $hourData->orders_count : 0,
                'vendas' => $hourData ? (float) $hourData->total_sales : 0
            ];
        }
        
        return response()->json([
            'data' => $formattedData,
            'message' => 'Dados de vendas por horário recuperados com sucesso'
        ]);
    }
    
    /**
     * Traduz o nome do dia da semana para o português
     */
    private function translateDayName($dayName)
    {
        $translations = [
            'Sunday' => 'Domingo',
            'Monday' => 'Segunda',
            'Tuesday' => 'Terça',
            'Wednesday' => 'Quarta',
            'Thursday' => 'Quinta',
            'Friday' => 'Sexta',
            'Saturday' => 'Sábado'
        ];
        
        return $translations[$dayName] ?? $dayName;
    }
    
    /**
     * Traduz a categoria para o português
     */
    private function translateCategory($category)
    {
        $translations = [
            'pizzas' => 'Pizzas',
            'drinks' => 'Bebidas',
            'desserts' => 'Sobremesas'
        ];
        
        return $translations[$category] ?? $category;
    }
}