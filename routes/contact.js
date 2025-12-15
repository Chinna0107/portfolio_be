const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Create transporter only if email config exists
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
  }
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Log contact data
    console.log('Contact form submission:', { 
      name, 
      email, 
      message, 
      timestamp: new Date() 
    });

    // Try to send emails if transporter is available
    if (transporter) {
      try {
        const userMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Thank you for contacting me, ${name}`,
          html: `
            <h3>Thank you for your message!</h3>
            <p>Hi ${name},</p>
            <p>I received your message and will get back to you soon.</p>
            <p><strong>Your message:</strong></p>



            
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p>Best regards</p>
            <b>Hemanth Kancharla</b>
          `
        };

        const adminMailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          replyTo: email,
          subject: `Portfolio Contact: ${name}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          `
        };

        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);
        console.log('Emails sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    } else {
      console.log('Email transporter not available - emails not sent');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Message received successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;