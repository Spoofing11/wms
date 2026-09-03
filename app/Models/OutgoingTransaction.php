<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutgoingTransaction extends Model
{
    use SoftDeletes;

    protected $table = 'outgoing_transactions';

    protected $fillable = [
        'transaction_id',
        'transaction_date',
        'product_id',
        'quantity',
        'condition',
        'usage_type',
        'project_name',
        'notes',
        'pickup_time',
        'user_id',
        'taken_by',
        'project_id',
        'material_request_item_id',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'quantity' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function materialRequestItem(): BelongsTo
    {
        return $this->belongsTo(MaterialRequestItem::class);
    }
}
