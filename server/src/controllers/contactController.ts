import { Request, Response } from 'express';
import mailService from '../services/mailService';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, language, languageName } = req.body;

    console.log('Gelen Form Verisi:', req.body);
    console.log('Dil Bilgisi:', { language, languageName });

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Send email
    const emailSent = await mailService.sendContactFormEmail({
      name,
      email,
      subject,
      message,
      language,
      languageName
    });

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: 'Your message has been successfully sent. We will get back to you as soon as possible.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred while sending the message. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred. Please try again later.'
    });
  }
};

export const sendDirectEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, message } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Send email
    const emailSent = await mailService.sendDirectEmail(to, subject, message);

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An error occurred while sending the email'
      });
    }
  } catch (error) {
    console.error('Direct email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};

export const testMailConnection = async (req: Request, res: Response) => {
  try {
    const isConnected = await mailService.verifyConnection();
    
    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Mail service connection successful'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Mail service connection failed'
      });
    }
  } catch (error) {
    console.error('Mail connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Mail service test failed'
    });
  }
};
