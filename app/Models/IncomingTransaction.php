<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomingTransaction extends Model
{
    use SoftDeletes;

    protected $table = 'incoming_transactions';

    protected $fillable = [
        'transaction_id',
        'transaction_date',
        'product_id',
        'purchase_request_id',
        'purchase_source_id',
        'user_id',
        'quantity',
        'notes',
        'purchase_price',
        'unit_price',
        'invoice_number',
        'payment_method',
        'coupon_discount',
        'store_discount',
        'shipping_cost',
        'shipping_discount',
        'insurance_fee',
        'platform_fee',
        'used_bonus',
        'total_amount',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'quantity' => 'integer',
        'purchase_price' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'store_discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'shipping_discount' => 'decimal:2',
        'insurance_fee' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'used_bonus' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function purchaseSource(): BelongsTo
    {
        return $this->belongsTo(PurchaseSource::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }
}
