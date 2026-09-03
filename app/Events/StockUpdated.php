<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $productId,
        public int $newStock,
        public ?string $transactionType = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('warehouse.stock'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'StockUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->productId,
            'new_stock' => $this->newStock,
            'transaction_type' => $this->transactionType,
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
