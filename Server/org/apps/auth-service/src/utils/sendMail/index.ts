import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const renderEmailTemplate = async (templateName: string, context: any): Promise<string> => {
    const templatePath = path.join(process.cwd(),`apps`,`auth-service`, 'src', 'utils', 'sendMail', 'email-templates', `${templateName}.ejs`)
    return ejs.renderFile(templatePath,context);};


export const sendMail = async (to: string, subject: string, templateName: string, context: any) => {
    try {
        const htmlContent = await renderEmailTemplate(templateName, context);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html: htmlContent,
        });

        console.log(`Email sent to ${to}`)
        return true;
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw error;
    }}

 