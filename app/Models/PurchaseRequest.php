<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequest extends Model
{
    use SoftDeletes;

    protected $table = 'purchase_requests';

    protected $fillable = [
        'item_name',
        'product_id',
        'quantity',
        'requested_by',
        'status',
        'rejection_reason',
        'material_request_item_id',
        'cancelled_at',
        'cancelled_by',
        'project_id',
        'project_name',
        'urgency',
        'notes',
        'requester_name',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function canceller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function materialRequestItem(): BelongsTo
    {
        return $this->belongsTo(MaterialRequestItem::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
