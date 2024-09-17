const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

async function testEmail() {
    let transporter = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        // login:'7c20e4001@smtp-brevo.com',
        auth: {
        user:'MASTER PASSWORD',
            pass: 'AS73IyMYfR0ZdC1D'
        }
    });

    let info = await transporter.sendMail({
        from: 'Sarthak <sarthakgoyal809@gmail.com>',
        to: 'sarthakgoyal809@gmail.com',
        subject: 'Test Email',
        text: 'This is a test email'
    });

    console.log('Message sent: %s', info.messageId);
}

testEmail().catch(console.error);
