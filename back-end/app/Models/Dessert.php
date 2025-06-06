<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dessert extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'ingredients'
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}