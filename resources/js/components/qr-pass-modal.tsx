import { Check, Copy, Download, Loader2, Mail, Printer, QrCode, Send, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface QrPassTeacher {
    id: number;
    full_name: string;
    employee_id: string;
    email?: string | null;
    department?: string | null;
    rank?: string | null;
    qr_payload: string;
}

interface QrPassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: QrPassTeacher | null;
}

/**
 * Generates a high-resolution QR Code PNG for the given teacher and sends it to their email via the backend.
 */
export async function generateAndEmailTeacherQrPass(
    teacher: QrPassTeacher,
    existingQrDataUrl?: string,
): Promise<{ success: boolean; message: string; email?: string }> {
    const qrDataUrl =
        existingQrDataUrl ||
        (await QRCode.toDataURL(teacher.qr_payload, {
            width: 320,
            margin: 2,
            color: {
                dark: '#7f1d1d',
                light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
        }));

    const csrfToken =
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const res = await fetch(`/teachers/${teacher.id}/send-qr-pass`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            ...(xsrfCookie ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfCookie) } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            qr_image_base64: qrDataUrl,
            email: teacher.email || undefined,
        }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to send QR Pass email.');
    }

    return json;
}

export function QrPassModal({ open, onOpenChange, teacher }: QrPassModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

    useEffect(() => {
        setEmailSentTo(null);
        if (open && teacher?.qr_payload) {
            QRCode.toDataURL(teacher.qr_payload, {
                width: 320,
                margin: 2,
                color: {
                    dark: '#7f1d1d', // WMSU Crimson dark tone for high contrast
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'H',
            })
                .then((url) => setQrDataUrl(url))
                .catch(() => setQrDataUrl(''));
        }
    }, [open, teacher?.qr_payload]);

    if (!teacher) {
        return null;
    }

    const handleCopyPayload = () => {
        navigator.clipboard.writeText(teacher.qr_payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPng = () => {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.download = `WMSU-QR-${teacher.employee_id}-${teacher.full_name.replace(/\s+/g, '_')}.png`;
        link.href = qrDataUrl;
        link.click();
    };

    const handleSendToEmail = async () => {
        if (isSendingEmail) return;
        setIsSendingEmail(true);
        try {
            const result = await generateAndEmailTeacherQrPass(teacher, qrDataUrl || undefined);
            setEmailSentTo(result.email || teacher.email || 'teacher email');
            toast.success(result.message);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unable to send QR Pass to email.';
            toast.error(msg);
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handlePrintPass = () => {
        if (!qrDataUrl) return;
        const printWin = window.open('', '_blank', 'width=480,height=640');
        if (!printWin) return;

        printWin.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WMSU Faculty QR Pass - ${teacher.full_name}</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f8fafc;
                    }
                    .card {
                        width: 320px;
                        border: 2px solid #7f1d1d;
                        border-radius: 16px;
                        overflow: hidden;
                        background: #fff;
                        text-align: center;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    }
                    .header {
                        background: #7f1d1d;
                        color: #fff;
                        padding: 16px;
                    }
                    .header h2 {
                        margin: 0;
                        font-size: 15px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    .header p {
                        margin: 4px 0 0;
                        font-size: 11px;
                        opacity: 0.85;
                    }
                    .qr-box {
                        padding: 20px;
                    }
                    .qr-box img {
                        width: 220px;
                        height: 220px;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 8px;
                    }
                    .info {
                        padding: 0 20px 20px;
                    }
                    .name {
                        font-size: 18px;
                        font-weight: 700;
                        color: #0f172a;
                        margin: 0;
                    }
                    .meta {
                        font-size: 12px;
                        color: #475569;
                        margin: 4px 0;
                    }
                    .badge {
                        display: inline-block;
                        margin-top: 8px;
                        padding: 4px 10px;
                        background: #fef2f2;
                        color: #991b1b;
                        border: 1px solid #fecaca;
                        border-radius: 999px;
                        font-size: 11px;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h2>Western Mindanao State University</h2>
                        <p>Classroom QR Kiosk Attendance Pass</p>
                    </div>
                    <div class="qr-box">
                        <img src="${qrDataUrl}" alt="QR Code" />
                    </div>
                    <div class="info">
                        <p class="name">${teacher.full_name}</p>
                        <p class="meta">${teacher.department || 'Faculty'} ${teacher.rank ? `• ${teacher.rank}` : ''}</p>
                        <span class="badge">ID: ${teacher.employee_id}</span>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); };
                </script>
            </body>
            </html>
        `);
        printWin.document.close();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
                <DialogHeader className="bg-primary text-primary-foreground p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
                                <QrCode className="size-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-white">
                                    Classroom QR Clock-In Pass
                                </DialogTitle>
                                <DialogDescription className="text-xs text-white/80">
                                    Western Mindanao State University • Single-Scan Present
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                            Official ID
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    {/* QR Code Frame */}
                    <div className="relative rounded-2xl border-2 border-primary/20 bg-white p-3 shadow-sm">
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt={`QR Code for ${teacher.full_name}`}
                                className="size-48 object-contain"
                            />
                        ) : (
                            <div className="size-48 flex items-center justify-center text-xs text-muted-foreground">
                                Generating QR Pass...
                            </div>
                        )}
                    </div>

                    {/* Instructor Details */}
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground">{teacher.full_name}</h3>
                        <p className="text-xs text-muted-foreground">
                            {teacher.department || 'Faculty Instructor'}
                            {teacher.rank ? ` • ${teacher.rank}` : ''}
                        </p>
                        {teacher.email && (
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Mail className="size-3" />
                                {teacher.email}
                            </p>
                        )}
                        <div className="pt-1 flex items-center justify-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs border-primary/30 bg-primary/5 text-primary">
                                ID: {teacher.employee_id}
                            </Badge>
                            <Badge variant="outline" className="text-[11px] gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck className="size-3" />
                                Signed Token
                            </Badge>
                        </div>
                    </div>

                    {/* Send QR Pass to Teacher Email Box */}
                    <div className="w-full rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2 text-left">
                            <div className="min-w-0">
                                <span className="block text-xs font-semibold text-foreground">
                                    Email QR Pass to Teacher
                                </span>
                                <span className="block truncate text-[11px] text-muted-foreground">
                                    {teacher.email || 'Send official QR pass image & token to email'}
                                </span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                disabled={isSendingEmail || !qrDataUrl}
                                onClick={handleSendToEmail}
                                className="h-8 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold gap-1.5 shrink-0"
                            >
                                {isSendingEmail ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        Sending...
                                    </>
                                ) : emailSentTo ? (
                                    <>
                                        <Check className="size-3.5" />
                                        Resend Email
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-3.5" />
                                        Send to Email
                                    </>
                                )}
                            </Button>
                        </div>
                        {emailSentTo && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 text-left">
                                <Check className="size-3.5 shrink-0 text-emerald-600" />
                                <span>
                                    QR Pass sent to <strong>{emailSentTo}</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Copyable Payload for Testing / Backup */}
                    <div className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 flex items-center justify-between gap-2 text-left">
                        <div className="min-w-0 flex-1">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                QR Token Payload
                            </span>
                            <code className="block truncate text-xs font-mono text-foreground">
                                {teacher.qr_payload}
                            </code>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs shrink-0"
                            onClick={handleCopyPayload}
                        >
                            {copied ? (
                                <>
                                    <Check className="size-3.5 mr-1 text-emerald-600" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="size-3.5 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-border/80 bg-muted/20 flex-row justify-between sm:justify-between gap-2">
                    <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={handlePrintPass}>
                        <Printer className="size-3.5 mr-1.5" />
                        Print Pass
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadPng}>
                            <Download className="size-3.5 mr-1.5" />
                            Download PNG
                        </Button>
                        <Button type="button" size="sm" className="text-xs h-8" onClick={() => onOpenChange(false)}>
                            Done
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
