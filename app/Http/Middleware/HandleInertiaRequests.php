<?php

namespace App\Http\Middleware;

use App\Models\MaterialRequestItem;
use App\Models\PurchaseRequest;
use App\Models\StockReplenishment;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'navBadges' => $this->getNavBadges(),
            'permissions' => fn () => $request->user()
                ? $request->user()->load('roles.permissions')->roles->flatMap->permissions->pluck('slug')->unique()->values()->all()
                : [],
        ];
    }

    protected function getNavBadges(): array
    {
        return [
            'master.products.index' => PurchaseRequest::whereNull('product_id')
                ->where('status', 'disetujui')->count(),
            'transactions.barang-masuk' => StockReplenishment::where('status', 'disetujui_purchasing')->count(),
            'operational.admin-proyek' => StockReplenishment::where('status', 'diajukan')->count(),
            'operational.approval' => MaterialRequestItem::whereIn('status', ['diajukan', 'disetujui', 'siap_ambil'])->count(),
            'purchasing.index' => StockReplenishment::where('status', 'disetujui_admin')->count(),
        ];
    }
}
