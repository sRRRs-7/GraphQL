import nodemailer from "nodemailer";

export const sendEmail = async(to: string, html: string) => {
    let testAccount = await nodemailer.createTestAccount();
    console.log(testAccount)

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>',
        to: to,
        subject: "change password",
        text: "",
        html: html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}