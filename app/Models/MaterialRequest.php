<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaterialRequest extends Model
{
    use SoftDeletes;

    protected $table = 'material_requests';

    protected $fillable = [
        'request_date',
        'project_id',
        'division',
        'division_other',
        'requester_name',
        'requester_id',
        'usage_type',
        'urgency',
        'status',
        'created_by',
        'request_datetime',
        'pickup_time',
        'photo',
        'ready_photo',
    ];

    protected $casts = [
        'request_date' => 'datetime',
        'request_datetime' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MaterialRequestItem::class);
    }
}
