<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Approval Receipt</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #000;
            padding: 12px;
        }

        /* ===== HEADER ===== */
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        .header-table td { vertical-align: middle; }
        .logo-cell { width: 20%; text-align: left; }
        .logo-cell img { width: 38px; height: auto; display: block; }
        .company-cell { width: 80%; text-align: center; }
        .company-name {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sub-info {
            font-size: 9px;
            color: #000;
            margin-top: 6px;
            text-align: center;
        }

        /* ===== SEPARATORS ===== */
        .line { border-top: 1.5px solid #000; margin: 6px 0; }
        .line-thin { border-top: 0.75px solid #000; margin: 4px 0; }

        /* ===== INFO SECTION ===== */
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
        .info-table td { padding: 2px 0; font-size: 10px; vertical-align: top; }
        .info-label { width: 75px; font-weight: bold; white-space: nowrap; }
        .info-sep { width: 12px; text-align: center; }

        /* ===== ITEMS TABLE ===== */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 2px; }
        .items-table th {
            font-weight: bold;
            border-bottom: 1.5px solid #000;
            padding: 4px 0;
            font-size: 10px;
            text-align: left;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 4px 0;
            border-bottom: 0.75px solid #000;
            font-size: 10px;
            vertical-align: middle;
        }
        .items-table tr:last-child td { border-bottom: 1.5px solid #000; }
        .col-no { width: 30px; text-align: center; }
        .col-qty { width: 40px; text-align: right; font-weight: bold; }

        /* ===== TOTAL ===== */
        .total-section {
            margin: 6px 0;
            font-weight: bold;
            font-size: 10px;
            text-align: right;
        }

        /* ===== NOTES ===== */
        .notes-section { margin-bottom: 4px; }
        .notes-label { font-weight: bold; font-size: 10px; text-transform: uppercase; }
        .notes-text {
            margin-top: 3px;
            font-size: 10px;
            padding: 4px 6px;
            border-left: 2px solid #000;
        }

        /* ===== FOOTER ===== */
        .footer { text-align: center; margin-top: 8px; }
        .footer .thanks {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-top: 6px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>

    @php
        $mr = $item->materialRequest;
        $outgoing = $item->outgoingTransaction;

        $date = $mr->request_date
            ? \Carbon\Carbon::parse($mr->request_date)->format('d - m - Y')
            : date('d - m - Y');

        $outgoingCode = $outgoing?->transaction_id ?? '-';
        $mrCode = 'MR-' . str_pad($mr->id, 3, '0', STR_PAD_LEFT);

        $pemohon = $mr->requester_name ?: '-';
        $proyek = $mr->project->name ?? '-';
        $pickupTime = $mr->pickup_time ?: '-';

        $notes = $item->notes ?? $mr->notes ?? null;
    @endphp

    <!-- Header: Logo kiri + Nama Perusahaan kanan -->
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            @if (!empty($logoBase64))
                <td class="logo-cell">
                    <img src="{{ $logoBase64 }}" alt="Logo">
                </td>
            @endif
            <td class="company-cell">
                <div class="company-name">PT Composite Interior Prima</div>
            </td>
        </tr>
    </table>
    <div class="sub-info">{{ $date }} &nbsp;|&nbsp; {{ $outgoingCode }} &nbsp;|&nbsp; {{ $mrCode }}</div>

    <div class="line"></div>

    <!-- Info Pemohon -->
    <table class="info-table" cellpadding="0" cellspacing="0">
        <tr>
            <td class="info-label">Pemohon</td>
            <td class="info-sep">:</td>
            <td>{{ $pemohon }}</td>
        </tr>
        <tr>
            <td class="info-label">Proyek</td>
            <td class="info-sep">:</td>
            <td>{{ $proyek }}</td>
        </tr>
        <tr>
            <td class="info-label">Waktu Ambil</td>
            <td class="info-sep">:</td>
            <td>{{ $pickupTime }}</td>
        </tr>
    </table>

    <div class="line"></div>

    <!-- Tabel Items -->
    <table class="items-table" cellpadding="0" cellspacing="0">
        <thead>
            <tr>
                <th class="col-no">✓</th>
                <th>Nama Barang</th>
                <th class="col-qty">Qty</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($mr->items as $idx => $mItem)
                <tr>
                    <td class="col-no">☐</td>
                    <td>{{ $mItem->product->name ?? $mItem->new_item_name ?? '-' }}</td>
                    <td class="col-qty">{{ $mItem->quantity_requested }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" style="text-align: center; padding: 8px 0;">Tidak ada item</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Total -->
    <div class="total-section">
        Total: {{ $mr->items->count() }} jenis barang
    </div>

    <!-- Catatan -->
    @if ($notes)
        <div class="notes-section">
            <div class="notes-label">Catatan</div>
            <div class="notes-text">{{ $notes }}</div>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <div class="line"></div>
        <div class="thanks">*** Terima Kasih ***</div>
    </div>

</body>
</html>
