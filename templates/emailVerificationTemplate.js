const generateEmailVerificationTemplate = (token) => {
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email address - SkillUp</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
                color: #333333;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
                background-color: #4a90e2;
                padding: 30px 20px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
                letter-spacing: 1px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
                margin-bottom: 25px;
            }
            .btn {
                display: inline-block;
                padding: 14px 32px;
                background-color: #4a90e2;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            .btn:hover {
                background-color: #357abd;
            }
            .warning {
                font-size: 14px;
                color: #888888;
                margin-top: 30px;
            }
            .fallback {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eeeeee;
                font-size: 13px;
                color: #777777;
                word-break: break-all;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #aaaaaa;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SkillUp</h1>
            </div>
            <div class="content">
                <h2>Welcome to SkillUp!</h2>
                <p>We're excited to have you on board. Please verify your email address to complete your registration and unlock full access to our courses.</p>
                
                <a href="${verificationUrl}" class="btn">Verify Email</a>
                
                <p class="warning">This link will expire in 24 hours.</p>
                
                <div class="fallback">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </div>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} SkillUp. All rights reserved.<br>
                If you did not request this verification, please ignore this email.
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generateEmailVerificationTemplate
};
