<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Permintaan Bahan</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #1a1a1a; }

        .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { font-size: 13px; font-weight: normal; color: #555; margin-top: 4px; }
        .header .company { font-size: 11px; color: #777; margin-top: 2px; }

        .mr-section { page-break-inside: avoid; margin-bottom: 30px; }
        .mr-section:last-child { page-break-after: auto; }

        .mr-header { background-color: #f0f0f0; padding: 8px 12px; border: 1px solid #ccc; margin-bottom: 10px; }
        .mr-header .mr-code { font-size: 14px; font-weight: bold; }

        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table td { padding: 4px 8px; vertical-align: top; border: 1px solid #ddd; }
        .info-table .label { width: 120px; font-weight: bold; background-color: #f8f8f8; color: #555; }
        .info-table .value { width: auto; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .items-table th { background-color: #2c3e50; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: bold; border: 1px solid #1a252f; }
        .items-table td { padding: 5px 8px; border: 1px solid #ddd; font-size: 10px; vertical-align: top; }
        .items-table tr:nth-child(even) td { background-color: #f9f9f9; }

        .status-badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; }
        .status-diajukan { background-color: #dbeafe; color: #1e40af; }
        .status-disetujui { background-color: #d1fae5; color: #065f46; }
        .status-siap_ambil { background-color: #fef3c7; color: #92400e; }
        .status-diterima { background-color: #d1fae5; color: #065f46; }
        .status-diproses { background-color: #fed7aa; color: #9a3412; }
        .status-ditolak { background-color: #fee2e2; color: #991b1b; }
        .status-default { background-color: #e5e7eb; color: #374151; }

        .urgent-badge { color: #dc2626; font-weight: bold; }
        .normal-badge { color: #2563eb; }

        .photos-section { margin-top: 10px; }
        .photos-section h4 { font-size: 11px; margin-bottom: 5px; color: #555; }
        .photos-grid { display: inline-block; }
        .photo-item { display: inline-block; margin-right: 8px; margin-bottom: 8px; }
        .photo-item img { width: 120px; height: 90px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; }
        .photo-label { font-size: 9px; color: #777; text-align: center; margin-top: 2px; }

        .section-title { font-size: 12px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; color: #333; }

        .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9px; color: #999; }
    </style>
</head>
<body>

    <div class="header">
        <div class="company">PT Composite Interior Prima</div>
        <h1>Surat Permintaan Bahan</h1>
        <h2>Daftar Permintaan Bahan dari Proyek</h2>
    </div>

    @forelse ($materialRequests as $mr)
        <div class="mr-section">
            <div class="mr-header">
                <span class="mr-code">{{ $mr->requester_name ? 'MR-' . str_pad($mr->id, 3, '0', STR_PAD_LEFT) : 'MR-' . str_pad($mr->id, 3, '0', STR_PAD_LEFT) }}</span>
            </div>

            <table class="info-table">
                <tr>
                    <td class="label">Pemohon</td>
                    <td class="value">{{ $mr->requester_name ?: '-' }}</td>
                    <td class="label">Divisi</td>
                    <td class="value">{{ $mr->division ?: '-' }}{{ $mr->division_other ? ' (' . $mr->division_other . ')' : '' }}</td>
                </tr>
                <tr>
                    <td class="label">Proyek</td>
                    <td class="value">{{ $mr->project->name ?? '-' }}</td>
                    <td class="label">Tanggal</td>
                    <td class="value">{{ $mr->request_date ? \Carbon\Carbon::parse($mr->request_date)->locale('id')->isoFormat('D MMMM Y') : '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Urgensi</td>
                    <td class="value">
                        @if ($mr->urgency === 'urgent')
                            <span class="urgent-badge">Urgent</span>
                        @else
                            <span class="normal-badge">Normal</span>
                        @endif
                    </td>
                    <td class="label">Jenis Pemakaian</td>
                    <td class="value">{{ $mr->usage_type === 'borrow' ? 'Pinjam' : 'Habis Pakai' }}</td>
                </tr>
            </table>

            <div class="section-title">Data Barang ({{ $mr->items->count() }} item)</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">No</th>
                        <th>Nama Barang</th>
                        <th style="width: 70px;">SKU</th>
                        <th style="width: 50px;">Qty</th>
                        <th style="width: 65px;">Qty Pengadaan</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($mr->items as $idx => $item)
                        <tr>
                            <td>{{ $idx + 1 }}</td>
                            <td>{{ $item->product->name ?? $item->new_item_name ?? '-' }}</td>
                            <td>{{ $item->product->sku ?? '-' }}</td>
                            <td>{{ $item->quantity_requested }}</td>
                            <td>{{ $item->purchase_quantity ?? '-' }}</td>
                            <td>{{ $item->notes ?? '-' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="text-align: center; color: #999;">Tidak ada item</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            @php
                $photos = $mr->items->filter(function ($item) { return $item->photo; });
            @endphp

            @if ($photos->count() > 0)
                <div class="photos-section">
                    <h4>Foto Barang</h4>
                    @foreach ($photos as $item)
                        @php
                            $photoPath = public_path('storage/' . $item->photo);
                            $base64 = '';
                            if (file_exists($photoPath)) {
                                $imageData = file_get_contents($photoPath);
                                $mime = mime_content_type($photoPath);
                                $base64 = 'data:' . $mime . ';base64,' . base64_encode($imageData);
                            }
                        @endphp
                        @if ($base64)
                            <div class="photo-item">
                                <img src="{{ $base64 }}" alt="Foto">
                                <div class="photo-label">{{ $item->product->name ?? $item->new_item_name ?? '-' }}</div>
                            </div>
                        @endif
                    @endforeach
                </div>
            @endif
        </div>

        @if (!$loop->last)
            <div style="page-break-after: always;"></div>
        @endif
    @empty
        <div style="text-align: center; padding: 40px; color: #999;">
            <p>Tidak ada data permintaan bahan.</p>
        </div>
    @endforelse

    <div class="footer">
        Dicetak pada {{ \Carbon\Carbon::now()->locale('id')->isoFormat('D MMMM Y, HH:mm') }} | PT Composite Interior Prima
    </div>

</body>
</html>
