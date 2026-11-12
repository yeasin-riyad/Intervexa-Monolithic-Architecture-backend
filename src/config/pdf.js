
const extractText = async (buffer) => {
    try {
        // Load pdf-parse only when needed
        const { PDFParse } = await import("pdf-parse");

        const pdf = new PDFParse({ data: buffer });

        try {
            const result = await pdf.getText();
            return result.text;
        } finally {
            await pdf.destroy();
        }
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        throw new Error("PDF extraction is temporarily unavailable.");
    }
};

export default extractText;
