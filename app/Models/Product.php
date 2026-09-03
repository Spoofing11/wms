<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'sequence_number',
        'category_id',
        'purchase_source_id',
        'location_id',
        'sku',
        'name',
        'stock',
        'min_stock',
        'image',
        'price',
        'average_cost',
    ];

    protected $casts = [
        'sequence_number' => 'integer',
        'stock' => 'integer',
        'min_stock' => 'integer',
        'price' => 'decimal:2',
        'average_cost' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function purchaseSource(): BelongsTo
    {
        return $this->belongsTo(PurchaseSource::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function materialRequestItems(): HasMany
    {
        return $this->hasMany(MaterialRequestItem::class);
    }
}
