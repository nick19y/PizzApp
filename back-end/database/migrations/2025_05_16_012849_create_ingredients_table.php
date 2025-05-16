<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('categoria');
            $table->decimal('preco_compra', 10, 2);
            $table->decimal('preco_venda', 10, 2)->default(0);
            $table->decimal('quantidade_estoque', 10, 2);
            $table->decimal('estoque_minimo', 10, 2);
            $table->string('fornecedor');
            $table->string('localizacao')->nullable();
            $table->date('data_ultima_compra')->nullable();
            $table->string('unidade_medida');
            $table->date('data_validade');
            $table->string('imagem')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};