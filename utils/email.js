
const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')
// New Email (user,url).sendWelcome();
module.exports = class Email {
    constructor(user,url) {
this.to = user.email;
this.firstName = user.name.split(' ')[0];
this.url = url;
this.from = `Sarthak <${process.env.EMAIL_FROM}>`
    }

newTransport(){
    if(process.env.NODE_ENV === 'production'){
       
        return nodemailer.createTransport({
            host: 'smtp-relay.brevo.com', // Brevo's SMTP server address
            port: 587,
            auth:{ 
                user:process.env.BREVO_USERNAME,
                pass:process.env.BREVO_PASSWORD
            }
        })
    }
    return nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD }
    })

}

// send the actual email 
async send(template,subject){
// 1 render the template
const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
    firstName:this.firstName,
    url:this.url,
    subject
})


//2 define the email options
const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    html,
    text: htmlToText.convert(html)
    // html: '<h1>Hello</h1><p>This is a test email</p>'  // if you want to send HTML email

}
// 3 create a transport objectand send it
await this.newTransport().sendMail(mailOptions);
}

async sendWelcome(){
    await this.send('Welcome','Welcome to the Natours family');
}

async SendPasswordReset(){
    await this.send('passwordReset','Reset your password(valid for 10 minutes)');
}
}

