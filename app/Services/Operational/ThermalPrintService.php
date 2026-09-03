<?php

namespace App\Services\Operational;

use Mike42\Escpos\EscposImage;
use Mike42\Escpos\PrintConnectors\DummyPrintConnector;
use Mike42\Escpos\Printer;

class ThermalPrintService
{
    public function generatePrintData($materialRequestItem): string
    {
        $mr = $materialRequestItem->materialRequest;
        $outgoing = $materialRequestItem->outgoingTransaction;

        $connector = new DummyPrintConnector();
        $printer = new Printer($connector);

        // ── Header ──
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->setTextSize(2, 2);
        $printer->setFont(Printer::FONT_A);
        $printer->text("PT COMPOSITE INTERIOR PRIMA\n");
        $printer->setTextSize(1, 1);

        $date = $mr->request_date
            ? \Carbon\Carbon::parse($mr->request_date)->format('d - m - Y')
            : date('d - m - Y');

        $outgoingCode = $outgoing?->transaction_id ?? '-';
        $mrCode = 'MR-' . str_pad($mr->id, 3, '0', STR_PAD_LEFT);

        $printer->text("{$date} | {$outgoingCode} | {$mrCode}\n");
        $printer->setTextSize(1, 1);
        $printer->feed();

        // ── Garis pemisah ──
        $this->line($printer);
        $printer->feed();

        // ── Info ──
        $printer->setJustification(Printer::JUSTIFY_LEFT);

        $pemohon = $mr->requester_name ?: '-';
        $proyek = $mr->project->name ?? '-';
        $pickupTime = $mr->pickup_time ?: '-';

        $printer->text($this->row("Pemohon", $pemohon));
        $printer->text($this->row("Proyek", $proyek));
        $printer->text($this->row("Waktu Ambil", $pickupTime));
        $printer->feed();

        // ── Tabel Item ──
        $this->line($printer);

        $printer->setTextSize(1, 1);
        $printer->text($this->tableRow('✓', 'Nama Barang', 'Qty'));
        $this->line($printer);

        $items = $mr->items;
        foreach ($items as $item) {
            $name = $item->product->name ?? $item->new_item_name ?? '-';
            $qty = (string) $item->quantity_requested;
            $printer->text($this->tableRow('☐', $name, $qty));
        }

        $this->line($printer);
        $printer->text($this->row("Total", count($items) . " jenis barang"));
        $printer->feed();

        // ── Catatan ──
        $notes = $materialRequestItem->notes ?? $mr->notes ?? null;
        if ($notes) {
            $printer->text("Catatan: {$notes}\n");
            $printer->feed();
        }

        // ── Footer ──
        $this->line($printer);
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->text("*** TERIMA KASIH ***\n");
        $printer->feed(4); // Feed 4 baris (tanpa auto-cutter)

        // ── Encode ke base64 ──
        $rawData = $connector->getData();
        $connector->finalize();

        return base64_encode($rawData);
    }

    private function line(Printer $printer): void
    {
        $printer->text(str_repeat('-', 48) . "\n");
    }

    private function row(string $label, string $value): string
    {
        $labelPadded = str_pad($label, 14, ' ');
        return "{$labelPadded}: {$value}\n";
    }

    private function tableRow(string $no, string $name, string $qty): string
    {
        // 48 chars total: No(3) + Name(33) + Qty(6) + spaces(6)
        $noStr = str_pad($no, 3, ' ');
        $nameStr = mb_substr($name, 0, 33);
        $nameStr = str_pad($nameStr, 33, ' ');
        $qtyStr = str_pad($qty, 6, ' ', STR_PAD_LEFT);

        return "{$noStr}  {$nameStr}{$qtyStr}\n";
    }
}
