<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WMSU Faculty QR Clock-In Pass</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <tr>
            <td style="background-color: #800000; color: #ffffff; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase;">
                    Western Mindanao State University
                </h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #fecaca;">
                    Official Classroom QR Kiosk Attendance Pass
                </p>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding: 28px 24px; text-align: center;">
                <p style="margin: 0 0 16px; font-size: 14px; color: #334155; line-height: 1.5;">
                    Hello <strong>{{ $teacher->full_name }}</strong>,<br>
                    Your official WMSU Classroom QR Clock-In Pass has been generated{{ $sentByName ? " by {$sentByName}" : '' }}.
                </p>

                <!-- QR Code Box -->
                @if(!empty($qrPngBinary) && isset($message))
                    <div style="display: inline-block; padding: 16px; border: 2px solid #fecaca; border-radius: 16px; background-color: #ffffff; margin: 8px 0 12px;">
                        <img src="{{ $message->embedData($qrPngBinary, 'wmsu-qr-pass.png', 'image/png') }}" alt="WMSU QR Pass" width="220" height="220" style="display: block; width: 220px; height: 220px;" />
                    </div>
                @elseif(!empty($qrDataUrl))
                    <div style="display: inline-block; padding: 16px; border: 2px solid #fecaca; border-radius: 16px; background-color: #ffffff; margin: 8px 0 12px;">
                        <img src="{{ $qrDataUrl }}" alt="WMSU QR Pass" width="220" height="220" style="display: block; width: 220px; height: 220px;" />
                    </div>
                @endif

                <!-- Save QR Button -->
                @if(!empty($downloadUrl))
                    <div style="margin: 0 0 20px;">
                        <a href="{{ $downloadUrl }}" target="_blank" download="WMSU-QR-Pass-{{ $teacher->employee_id }}.png" style="display: inline-block; background-color: #800000; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 22px; border-radius: 8px; letter-spacing: 0.01em;">
                            Save QR Code
                        </a>
                    </div>
                @endif

                <!-- Faculty Details Card -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                        <tr>
                            <td style="color: #64748b; width: 40%;">Instructor:</td>
                            <td style="font-weight: 700; color: #0f172a;">{{ $teacher->full_name }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Employee ID:</td>
                            <td style="font-family: monospace; font-weight: 700; color: #800000;">{{ $teacher->employee_id }}</td>
                        </tr>
                        @if($teacher->department)
                        <tr>
                            <td style="color: #64748b;">Department:</td>
                            <td style="color: #0f172a;">{{ $teacher->department }}</td>
                        </tr>
                        @endif
                        @if($teacher->rank)
                        <tr>
                            <td style="color: #64748b;">Academic Rank:</td>
                            <td style="color: #0f172a;">{{ $teacher->rank }}</td>
                        </tr>
                        @endif
                    </table>
                </div>

                <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
                    <strong>How to use:</strong> Present this QR pass (on your phone or printed) at your assigned classroom&rsquo;s registered QR Kiosk terminal. A single scan immediately records your attendance as <strong>Present</strong> (no time-out scan required).
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b;">
                WMSU Faculty Scheduling &amp; Attendance System &bull; Automated Notification
            </td>
        </tr>
    </table>
</body>
</html>
