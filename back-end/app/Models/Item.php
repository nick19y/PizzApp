<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'price_small',
        'price_medium',
        'price_large',
        'image',
        'available',
        'featured',
        'estimated_time'
    ];

    protected $casts = [
        'available' => 'boolean',
        'featured' => 'boolean',
        'price_small' => 'decimal:2',
        'price_medium' => 'decimal:2',
        'price_large' => 'decimal:2',
    ];

    // Relationships with specific types
    public function pizza()
    {
        return $this->hasOne(Pizza::class);
    }

    public function drink()
    {
        return $this->hasOne(Drink::class);
    }

    public function dessert()
    {
        return $this->hasOne(Dessert::class);
    }

    // Method to get specific details based on category
    public function getSpecificDetails()
    {
        switch ($this->category) {
            case 'pizzas':
                return $this->pizza;
            case 'drinks':
                return $this->drink;
            case 'desserts':
                return $this->dessert;
            default:
                return null;
        }
    }
}