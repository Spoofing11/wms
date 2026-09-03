<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockReplenishment extends Model
{
    use SoftDeletes;

    protected $table = 'stock_replenishments';

    protected $fillable = [
        'replenishment_id',
        'product_id',
        'quantity',
        'notes',
        'urgency',
        'status',
        'requested_by',
        'approved_by_admin',
        'approved_at_admin',
        'rejected_by_admin',
        'rejected_at_admin',
        'rejection_reason_admin',
        'approved_by_purchasing',
        'approved_at_purchasing',
        'rejected_by_purchasing',
        'rejected_at_purchasing',
        'rejection_reason_purchasing',
        'received_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'approved_at_admin' => 'datetime',
        'rejected_at_admin' => 'datetime',
        'approved_at_purchasing' => 'datetime',
        'rejected_at_purchasing' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_admin');
    }

    public function rejectedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by_admin');
    }

    public function approvedByPurchasing(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_purchasing');
    }

    public function rejectedByPurchasing(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by_purchasing');
    }
}
