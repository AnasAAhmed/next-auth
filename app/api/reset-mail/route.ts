import { NextResponse } from 'next/server';
import { MailtrapClient } from 'mailtrap';
import { PASSWORD_RESET_REQUEST_TEMPLATE } from '@/lib/utils';

const TOKEN = process.env.MAILTRAP_TOKEN!;

const client = new MailtrapClient({
  token: TOKEN,
  testInboxId: 3126243,
  accountId: 2047102,
});

const sender = {
  email: "mailtrap@example.com",
  name: "Mailtrap Test",
};

const recipients = [
  {
    email: "anasahmedd244@gmail.com",
  }
];
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { emailsToSend,userId, token } = body;

    if (!recipients || !token) {
      return NextResponse.json({ error: 'Recipients and reset token are required' }, { status: 400 });
    }
    // const emailRecipients = emailsToSend.map((email: string) => ({ email }));
    const resetUrl = `${process.env.DOMAIN_URL}/reset-password?token=${token}&id=${userId}`

    const response = await client.testing.send({
      from: sender,
      to: recipients,//for testing its only an owner email
      subject: "Password Reset Request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Reset Token",
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

