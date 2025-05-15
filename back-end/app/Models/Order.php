<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'total_amount',
        'delivery_address',
        'contact_phone',
        'notes',
        'delivery_time',
        'payment_method',
        'payment_status',
    ];

    protected $casts = [
        'delivery_time' => 'datetime',
        'payment_status' => 'boolean',
        'total_amount' => 'decimal:2'
    ];

    /**
     * Get the user that owns the order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the item orders for the order
     */
    public function itemOrders(): HasMany
    {
        return $this->hasMany(ItemOrder::class);
    }

    /**
     * Get all items in this order through item_orders table
     */
    public function items()
    {
        return $this->belongsToMany(Item::class, 'item_orders')
                    ->withPivot('size', 'quantity', 'unit_price', 'subtotal', 'special_instructions')
                    ->withTimestamps();
    }
}