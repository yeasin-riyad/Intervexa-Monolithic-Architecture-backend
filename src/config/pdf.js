import { PDFParse } from "pdf-parse";

const extractText = async (buffer) => {
    const pdf = new PDFParse({
        data: buffer,
    });

    try {
        const result = await pdf.getText();
        return result.text;
    } finally {
        await pdf.destroy();
    }
};

export default extractText;