<?php

namespace App\Services\Operational;

class ZebraPrintService
{
    private const PAPER_WIDTH_DOTS = 832; // 100mm @ 203 DPI
    private const LEFT_MARGIN = 30;
    private const LINE_THICKNESS = 2;

    public function generatePrintData($materialRequestItem): string
    {
        $mr = $materialRequestItem->materialRequest;
        $outgoing = $materialRequestItem->outgoingTransaction;

        $date = $mr->request_date
            ? \Carbon\Carbon::parse($mr->request_date)->format('d - m - Y')
            : date('d - m - Y');

        $outgoingCode = $outgoing?->transaction_id ?? '-';
        $mrCode = 'MR-' . str_pad($mr->id, 3, '0', STR_PAD_LEFT);
        $pemohon = $mr->requester_name ?: '-';
        $proyek = $mr->project->name ?? '-';
        $pickupTime = $mr->pickup_time ?: '-';

        $zpl = "^XA\n";
        $zpl .= "^CI28\n"; // UTF-8

        $y = 20;

        // ── Header: Company Name ──
        $zpl .= $this->text(200, $y, 'PT COMPOSITE INTERIOR PRIMA', 36);
        $y += 50;

        // ── Sub-info: date | outgoing code | MR code ──
        $subInfo = "{$date} | {$outgoingCode} | {$mrCode}";
        $zpl .= $this->textCenter($y, $subInfo, 22);
        $y += 40;

        // ── Garis ──
        $zpl .= $this->line($y);
        $y += 15;

        // ── Info Section ──
        $zpl .= $this->infoRow($y, 'Pemohon', $pemohon);
        $y += 30;
        $zpl .= $this->infoRow($y, 'Proyek', $proyek);
        $y += 30;
        $zpl .= $this->infoRow($y, 'Waktu Ambil', $pickupTime);
        $y += 30;

        // ── Garis ──
        $zpl .= $this->line($y);
        $y += 15;

        // ── Tabel Header ──
        $zpl .= $this->text(self::LEFT_MARGIN, $y, $this->tableHeader(), 24);
        $y += 30;
        $zpl .= $this->line($y);
        $y += 10;

        // ── Items ──
        $items = $mr->items;
        foreach ($items as $item) {
            $name = $item->product->name ?? $item->new_item_name ?? '-';
            $qty = (string) $item->quantity_requested;
            $zpl .= $this->text(self::LEFT_MARGIN, $y, $this->tableRow($name, $qty), 24);
            $y += 30;
        }

        // ── Garis ──
        $zpl .= $this->line($y);
        $y += 15;

        // ── Total ──
        $totalText = 'Total: ' . count($items) . ' jenis barang';
        $zpl .= $this->textRight($y, $totalText, 24);
        $y += 35;

        // ── Garis ──
        $zpl .= $this->line($y);
        $y += 15;

        // ── Catatan ──
        $notes = $materialRequestItem->notes ?? $mr->notes ?? null;
        if ($notes) {
            $zpl .= $this->text(self::LEFT_MARGIN, $y, 'Catatan: ' . mb_substr($notes, 0, 50), 22);
            $y += 30;
            $zpl .= $this->line($y);
            $y += 15;
        }

        // ── Footer ──
        $zpl .= $this->textCenter($y, '*** TERIMA KASIH ***', 22);

        $zpl .= "^XZ\n";

        return base64_encode($zpl);
    }

    private function text(int $x, int $y, string $content, int $height = 24): string
    {
        $cmd = "^FO{$x},{$y}^A0N,{$height}";
        $cmd .= "^FD" . $this->escapeZpl($content) . "^FS\n";
        return $cmd;
    }

    private function textCenter(int $y, string $content, int $height = 24): string
    {
        $textWidth = mb_strlen($content) * 12;
        $x = max(self::LEFT_MARGIN, (self::PAPER_WIDTH_DOTS - $textWidth) / 2);
        return $this->text((int) $x, $y, $content, $height);
    }

    private function textRight(int $y, string $content, int $height = 24): string
    {
        $textWidth = mb_strlen($content) * 12;
        $x = self::PAPER_WIDTH_DOTS - $textWidth - self::LEFT_MARGIN;
        return $this->text((int) $x, $y, $content, $height);
    }

    private function line(int $y): string
    {
        $width = self::PAPER_WIDTH_DOTS - (2 * self::LEFT_MARGIN);
        return "^FO" . self::LEFT_MARGIN . ",{$y}^GB{$width},0," . self::LINE_THICKNESS . "^FS\n";
    }

    private function infoRow(int $y, string $label, string $value): string
    {
        $paddedLabel = str_pad($label, 16);
        return $this->text(self::LEFT_MARGIN, $y, "{$paddedLabel}: {$value}", 24);
    }

    private function tableHeader(): string
    {
        // [x](3) + spaces(2) + Nama Barang(30) + spaces(2) + Qty(5)
        return "[x]  Nama Barang                   Qty";
    }

    private function tableRow(string $name, string $qty): string
    {
        $truncatedName = mb_substr($name, 0, 30);
        $paddedName = str_pad($truncatedName, 32);
        $paddedQty = str_pad($qty, 5, ' ', STR_PAD_LEFT);

        return "[ ]  {$paddedName}{$paddedQty}";
    }

    private function escapeZpl(string $text): string
    {
        $replacements = [
            '^' => '^^',
            '~' => '~~',
            '\\' => '\\\\',
        ];
        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }
}
