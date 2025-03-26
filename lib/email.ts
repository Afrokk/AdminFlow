import mailgun from 'mailgun-js';

type EmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
};

export async function sendEmail({ to, subject, text, html, from }: EmailOptions): Promise<boolean> {

  const isDemoMode = process.env.MAILGUN_API_KEY?.startsWith('placeholder');
  
  if (isDemoMode) {
    // In demo mode, just log the email instead of sending it
    console.log('========== DEMO MODE: EMAIL WOULD BE SENT ==========');
    console.log(`From: ${from || process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com'}`);
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${subject}`);
    console.log('Text:');
    console.log(text);
    console.log('HTML:');
    console.log(html || '(No HTML content)');
    console.log('====================================================');
    return true;
  }
  
  
  try {
    const mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY || '',
      domain: process.env.MAILGUN_DOMAIN || '',
    });

    const senderEmail = from || process.env.DEFAULT_FROM_EMAIL || 'noreply@example.com';
    
  
    const data = {
      from: senderEmail,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text,
      html: html || '',
    };

    await mg.messages().send(data);
    console.log(`Email sent successfully to ${data.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
} 
