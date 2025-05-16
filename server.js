import express from "express";
import puppeteer from "puppeteer-core";
import nodemailer from "nodemailer";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = "sent_links.log";
const EMAIL_TO = "svcmarineservices@gmail.com";

async function getInternalLinks() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/google-chrome"
  });

  const page = await browser.newPage();
  await page.goto("https://vimc-shipping.com", { waitUntil: "networkidle2" });

  const links = await page.$$eval("a", (as) =>
    as.map(a => a.href).filter(l => l.startsWith("https://vimc-shipping.com"))
  );

  await browser.close();
  return [...new Set(links)];
}

async function sendEmail(subject, body) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  await transporter.sendMail({ from: process.env.GMAIL_USER, to: EMAIL_TO, subject, text: body });
}

app.get("/", async (req, res) => {
  res.send("✅ App running");
  try {
    const links = await getInternalLinks();
    // etc...
  } catch (e) {
    console.error(e);
  }
});

app.listen(PORT);