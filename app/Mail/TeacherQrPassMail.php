<?php

namespace App\Mail;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class TeacherQrPassMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Teacher $teacher,
        public string $qrPayload,
        public ?string $qrPngBinary = null,
        public ?string $qrDataUrl = null,
        public ?string $sentByName = null,
        public ?string $downloadUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "WMSU Faculty QR Clock-In Pass — {$this->teacher->full_name} ({$this->teacher->employee_id})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-qr-pass',
            with: [
                'teacher' => $this->teacher,
                'qrPngBinary' => $this->qrPngBinary,
                'qrDataUrl' => $this->qrDataUrl,
                'sentByName' => $this->sentByName,
                'downloadUrl' => $this->downloadUrl ?? URL::signedRoute('teachers.download-qr-pass', ['teacher' => $this->teacher->id]),
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (! $this->qrPngBinary) {
            return [];
        }

        $safeEmployeeId = preg_replace('/[^A-Za-z0-9_-]/', '_', (string) $this->teacher->employee_id);

        return [
            Attachment::fromData(
                fn () => $this->qrPngBinary,
                "WMSU-QR-Pass-{$safeEmployeeId}.png"
            )->withMime('image/png'),
        ];
    }
}
