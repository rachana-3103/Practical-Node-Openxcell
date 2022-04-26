const nodemailer = require('nodemailer');

exports.sendMail = async (toMail, subject, body) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    const mailOptions = {
        from: process.env.SENDER,
        to: toMail,
        subject,
        html: body,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(' transporter.sendMail -> error', error);
            return error;
        }
        console.log(`Email sent: ${info.response}`, 'email>', toMail);
    });
};