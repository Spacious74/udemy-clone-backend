const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const generateCertificatePDF = async (data) => {
  // 1️⃣ Read HTML template
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "certificate.html"
  );

  let html = fs.readFileSync(templatePath, "utf8");

  html = html
    .replace("{{USER_NAME}}", data.userName)
    .replace("{{COURSE_NAME}}", data.courseName)
    .replace("{{INSTRUCTOR_NAME}}", data.instructorName)
    .replace("{{DATE}}", new Date().toDateString());

  // 2️⃣ Generate PDF buffer
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true
  });

  await browser.close();

  // 3️⃣ Upload buffer directly to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "certificates",
        public_id: data.certificateId
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
  });

  // 4️⃣ Return Cloud URL
  return uploadResult.secure_url;
};

module.exports = {
  generateCertificatePDF
}