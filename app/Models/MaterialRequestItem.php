<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MaterialRequestItem extends Model
{
    use SoftDeletes;

    protected $table = 'material_request_items';

    protected $fillable = [
        'material_request_id',
        'product_id',
        'specification',
        'quantity_requested',
        'notes',
        'new_item_name',
        'purchase_quantity',
        'ready_photo',
        'photo',
        'usage_type',
        'status',
        'approved_by',
        'approved_at',
        'photo_approved_by',
        'photo_approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'quantity_requested' => 'integer',
        'purchase_quantity' => 'integer',
        'approved_at' => 'datetime',
        'photo_approved_at' => 'datetime',
    ];

    public function materialRequest(): BelongsTo
    {
        return $this->belongsTo(MaterialRequest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function photoApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'photo_approved_by');
    }

    public function purchaseRequest(): HasOne
    {
        return $this->hasOne(PurchaseRequest::class);
    }

    public function outgoingTransaction(): HasOne
    {
        return $this->hasOne(OutgoingTransaction::class);
    }
}
