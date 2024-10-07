const nodemailer = require("nodemailer");

// Configure the transporter for Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: "crm@maynd.ir",
    pass: "1qaz!QAZ3edc#EDC",
  },
});

async function sendTicket(ticket) {
  try {
    
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: "cs.maynd@gmail.com",
      cc: ["hesan.ghaffari@daartagency.com", "sahba.sadegh@daartagency.com","saman.alaii10@gmail.com"],
      subject: `ایشوی جدید`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> سلام!</p>
          <p>مایند عزیز </p>
          <p> یک ایشوی جدید از سمت ${ticket.fullName} با شماره تیکت ${ticket.ticketNumber} ثبت شده است، و منتظر بررسی از سمت شماست. </p>
          </div>
      `,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
}

module.exports = sendTicket;
