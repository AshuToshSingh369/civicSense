const nodemailer = require('nodemailer');

// Initialize transporter with better error handling and fallback
let transporter = null;

const initializeTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use App Password for Gmail with 2FA
            }
        });
        console.log('✅ Email transporter initialized with Gmail');
        return true;
    } else {
        console.warn('⚠️ Email credentials not found. OTP/Email notifications will be logged only.');
        console.warn('⚠️ Set EMAIL_USER and EMAIL_PASS environment variables to enable email sending.');
        return false;
    }
};

// Verify transporter on startup
const verifyTransporter = async () => {
    if (!transporter) return false;
    try {
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        return false;
    }
};

// Initialize on module load
initializeTransporter();
verifyTransporter().catch(err => console.error('Transporter verification error:', err));

// ─── Status Change Notifications ───────────────────────────────────────────────

exports.sendStatusChangeNotification = async (report, oldStatus, newStatus, authorityName) => {
    const statusMessages = {
        'pending': 'Your report is pending review',
        'in-progress': 'Our team is working on your issue',
        'resolved': 'Your issue has been resolved',
        'rejected': 'Your report could not be processed'
    };

    const subject = `CivicSense Update: Report Status Changed to ${newStatus.toUpperCase()}`;
    const html = `
        <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <h2 style="color: #1e3a8a;">Report Status Update</h2>
            <p style="font-size: 16px; margin: 20px 0;">
                <strong>${statusMessages[newStatus] || `Status changed to ${newStatus}`}</strong>
            </p>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p><strong>Report:</strong> ${report.title}</p>
                <p><strong>Location:</strong> ${report.location}</p>
                <p><strong>Previous Status:</strong> ${oldStatus}</p>
                <p><strong>New Status:</strong> ${newStatus}</p>
                <p><strong>Updated by:</strong> ${authorityName || 'System'}</p>
                <p><strong>Updated at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Track your report at: <a href="${process.env.CLIENT_URL}/track-report/${report._id}" style="color: #3b82f6;">View Report</a>
            </p>
        </div>
    `;

    console.log(`\n📧 [STATUS UPDATE NOTIFICATION] To: ${report.user?.email || 'Unknown'} | Status: ${newStatus.toUpperCase()} 📧\n`);

    if (transporter && report.user?.email) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: report.user.email,
                subject,
                html
            });
            console.log('✅ Status change email sent successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to send status change email:', error.message);
            return false;
        }
    } else {
        console.log('ℹ️ Email not sent (missing transporter or user email). Check configuration.');
        return false;
    }
};

// ─── AI Analysis Notifications ───────────────────────────────────────────────

exports.sendNotification = async (report, analysis) => {
    const isCritical = analysis.severityScore >= 8;
    const isHigh = analysis.severityScore >= 6;

    if (!isCritical && !isHigh) {
        return; // No notification needed for low priority
    }

    const subject = `${analysis.threatLevel.toUpperCase()} ALERT: ${report.title}`;
    const html = `
        <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #fff5f5; border-radius: 8px; border: 2px solid #ef4444;">
            <h2 style="color: #dc2626;">🚨 Civic Issue Alert</h2>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p><strong>Threat Level:</strong> <span style="color: #ef4444; font-weight: bold;">${analysis.threatLevel.toUpperCase()}</span></p>
                <p><strong>Severity:</strong> ${analysis.severityScore}/10</p>
                <p><strong>Location:</strong> ${report.location}</p>
                <p><strong>Category:</strong> ${report.category || 'General'}</p>
                <p><strong>Issue Type:</strong> ${report.issueType || 'General'}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Detected Objects:</strong> ${analysis.detectedObjects.join(', ') || 'None'}</p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                <strong>Action Required:</strong> Please review this report at <a href="${process.env.CLIENT_URL}/authority-dashboard" style="color: #3b82f6;">Authority Dashboard</a>
            </p>
        </div>
    `;

    console.log(`\n🚨 [ALERT TRIGGERED]`);
    console.log(`Threat Level: ${analysis.threatLevel.toUpperCase()}`);
    console.log(`Severity Score: ${analysis.severityScore}/10`);
    console.log(`Location: ${report.location}`);
    console.log(`----------------------------------\n`);

    if (transporter && process.env.ALERT_EMAIL) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ALERT_EMAIL,
                subject,
                html
            });
            console.log('✅ Alert email sent successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to send alert email:', error.message);
            return false;
        }
    } else {
        console.log('ℹ️ Alert email not sent. Configure EMAIL_USER/EMAIL_PASS in .env');
        return false;
    }
};

// ─── OTP Email (CRITICAL FIX) ───────────────────────────────────────────────

exports.sendOTP = async (email, otp) => {
    const subject = `Your CivicSense Verification Code: ${otp}`;
    const html = `
        <div style="font-family: 'Arial', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bfdbfe;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1e3a8a; margin: 0;">CivicSense</h2>
                <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Email Verification</p>
            </div>
            
            <h3 style="color: #1e40af; margin-top: 20px;">Verify your Account</h3>
            <p style="font-size: 16px; color: #333; margin: 15px 0;">
                Thank you for joining CivicSense. Use the following code to verify your email address:
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #3b82f6;">
                <h1 style="color: #1e40af; letter-spacing: 8px; font-size: 36px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="font-size: 14px; color: #666; margin: 20px 0;">
                <strong>⏱️ This code will expire in 10 minutes.</strong>
            </p>
            
            <p style="font-size: 14px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
                If you did not request this verification code, please ignore this email or contact support.
            </p>
            
            <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 20px;">
                &copy; 2026 CivicSense. All rights reserved.
            </p>
        </div>
    `;

    console.log(`\n📧 [OTP SENT] To: ${email} | Code: ${otp} | Expires in 10 minutes 📧\n`);

    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. OTP display in console:');
        console.log(`   Email: ${email}`);
        console.log(`   OTP Code: ${otp}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"CivicSense" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html
        });
        console.log('✅ OTP email sent successfully. Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Suggestion: Ensure EMAIL_USER and EMAIL_PASS are set correctly in .env');
        console.warn('⚠️ Falling back to console display:');
        console.log(`   Email: ${email}`);
        console.log(`   OTP Code: ${otp}`);
        return false;
    }
};

