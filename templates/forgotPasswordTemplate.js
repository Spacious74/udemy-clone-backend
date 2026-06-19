const generateForgotPasswordTemplate = (resetUrl, username) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
        a{
            color : #fff;
        }
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background-color: #10B981;
                color: #ffffff;
                text-align: center;
                padding: 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 30px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                color: #333333;
                line-height: 1.5;
            }
            .reset-btn {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background-color: #0d9c6cff;
                color: #ffffffff;
                text-decoration: none;
                font-size: 18px;
                font-weight: bold;
                border-radius: 5px;
            }
            .reset-btn:hover {
                background-color: #0f9c6dff;
            }
            .footer {
                background-color: #f4f4f4;
                color: #777777;
                text-align: center;
                padding: 15px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello ${username},</p>
                <p>We received a request to reset your password for your SkillUp account. If you didn't make this request, you can safely ignore this email.</p>
                <p>To reset your password, please click the button below:</p>
                <a href="${resetUrl}" class="reset-btn">Reset Password</a>
                <p style="margin-top: 30px; font-size: 14px; color: #666;">This link will expire in 15 minutes.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SkillUp. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { generateForgotPasswordTemplate };
