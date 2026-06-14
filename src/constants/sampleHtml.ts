export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 3px solid #6366f1;
    }
    .header h1 {
      font-size: 24px;
      color: #6366f1;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .header p {
      color: #64748b;
      font-size: 12px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section h2 {
      font-size: 16px;
      color: #4f46e5;
      margin-bottom: 8px;
      padding-left: 10px;
      border-left: 4px solid #6366f1;
    }
    .section p {
      font-size: 13px;
      line-height: 1.7;
      color: #334155;
    }
    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .feature-card {
      background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
      border-radius: 8px;
      padding: 14px;
      border: 1px solid #c7d2fe;
    }
    .feature-card h3 {
      font-size: 13px;
      color: #4338ca;
      margin-bottom: 4px;
    }
    .feature-card p {
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 12px;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #6366f1;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
    }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #ede9fe; color: #5b21b6; }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 10px;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 18px 0;
      padding: 14px 0;
      background: #fafafa;
      border-radius: 8px;
    }
    .stat { text-align: center; }
    .stat .number {
      font-size: 28px;
      font-weight: bold;
      color: #6366f1;
    }
    .stat .label {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .tip-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 12px;
      font-size: 12px;
      color: #92400e;
      line-height: 1.6;
    }
    .tip-box strong { color: #78350f; }
  </style>
</head>
<body>

  <div class="header">
    <h1>📄 HTML to PDF Converter</h1>
    <p>Sample Document — Click "Continue to Preview" to configure & download</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="number">100%</div>
      <div class="label">WYSIWYG</div>
    </div>
    <div class="stat">
      <div class="number">∞</div>
      <div class="label">Pages</div>
    </div>
    <div class="stat">
      <div class="number">0</div>
      <div class="label">Cost</div>
    </div>
  </div>

  <div class="section">
    <h2>How It Works</h2>
    <p>
      Paste or write your HTML, click "Continue to Preview", then configure
      page settings on the right panel. The preview shows <strong>exactly</strong>
      what the PDF will look like — same pages, margins, and scale.
    </p>
    <div class="tip-box">
      <strong>💡 Try it:</strong> Use the <strong>Content Scale</strong> slider to shrink
      content to 70% (fits more per page) or enlarge to 150%. Switch margins
      to "None" or "Wide" and change paper size to "A5" to see pages reflow!
    </div>
  </div>

  <div class="section">
    <h2>Key Features</h2>
    <div class="features">
      <div class="feature-card">
        <h3>📄 Real Paper Preview</h3>
        <p>See actual pages with margins, page breaks, and page numbers.</p>
      </div>
      <div class="feature-card">
        <h3>📐 Configurable Margins</h3>
        <p>None, Narrow, Normal, Wide, or fully custom mm values.</p>
      </div>
      <div class="feature-card">
        <h3>🔍 Content Scale</h3>
        <p>Shrink to 50% or enlarge to 200% — controls how much fits per page.</p>
      </div>
      <div class="feature-card">
        <h3>⚡ WYSIWYG Output</h3>
        <p>Preview pages = PDF pages. What you see is what you get!</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Supported Paper Sizes</h2>
    <table>
      <thead>
        <tr>
          <th>Size</th>
          <th>Dimensions</th>
          <th>Common Use</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>A3</td>
          <td><span class="badge badge-blue">297 × 420 mm</span></td>
          <td>Posters, large diagrams</td>
        </tr>
        <tr>
          <td>A4</td>
          <td><span class="badge badge-green">210 × 297 mm</span></td>
          <td>Standard documents</td>
        </tr>
        <tr>
          <td>A5</td>
          <td><span class="badge badge-purple">148 × 210 mm</span></td>
          <td>Booklets, flyers</td>
        </tr>
        <tr>
          <td>Letter</td>
          <td><span class="badge badge-blue">8.5 × 11 in</span></td>
          <td>US standard</td>
        </tr>
        <tr>
          <td>Legal</td>
          <td><span class="badge badge-purple">8.5 × 14 in</span></td>
          <td>Legal documents</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated with HTML to PDF Converter — What you see is what you get!</p>
  </div>

</body>
</html>`;
