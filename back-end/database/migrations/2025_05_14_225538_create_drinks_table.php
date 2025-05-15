<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('drinks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->string('type')->nullable(); // Ex: soda, juice, water
            $table->integer('volume_ml')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('drinks');
    }
};