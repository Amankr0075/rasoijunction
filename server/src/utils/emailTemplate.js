export const generateEmailTemplate = (contentHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f7f6;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #ff6b6b;
          padding: 30px 20px;
          text-align: center;
        }
        .header img {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin-top: 40px;
          margin-bottom: 20px;
        }
        .btn {
          display: inline-block;
          background-color: #ff6b6b;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: #ff5252;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #eeeeee;
        }
        .footer p {
          margin: 5px 0;
          color: #666666;
          font-size: 14px;
        }
        .footer-logo {
          width: 80px;
          margin-top: 15px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="Rasoi Junction Logo" />
          <h1>Rasoi Junction</h1>
        </div>
        <div class="content">
          ${contentHtml}
          
          <div class="button-container">
            <a href="https://rasoijunction.vercel.app/" class="btn">Visit Rasoi Junction</a>
          </div>
        </div>
        <div class="footer">
          <p>Best regards,</p>
          <p><strong>The Rasoi Junction Team</strong></p>
          <img src="cid:logo" alt="Rasoi Junction" class="footer-logo" />
        </div>
      </div>
    </body>
    </html>
  `;
};
