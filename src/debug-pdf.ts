
import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist';

// Define Image/Token types locally
type Image = {
    width: number;
    height: number;
};
type ImageToken = { kind: "Image"; image: Image; y: number };
type StringToken = { kind: "String"; string: string; font: string };
type Token = ImageToken | StringToken;

// Set up worker
try {
    // Try to resolve pdf.worker.min.js
    const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
} catch (e) {
    console.log("Worker resolution failed, trying default.");
}

// Tokenize function adapted from src/pdf/lexers/pdf.ts
const tokenizePDF = async (
    docId: Uint8Array,
): Promise<
    [<R>(pageNum: number, f: (d: Token[]) => Promise<R>) => Promise<[R, () => boolean]>, () => Promise<void>]
> => {
    // @ts-ignore
    const doc = await pdfjsLib.getDocument(docId).promise;

    return [
        async <R>(pageNum: number, f: (d: Token[]) => Promise<R>): Promise<[R, () => boolean]> => {
            const page = await doc.getPage(pageNum);

            const opList = await page.getOperatorList();
            const data: { font: string; tokens: Token[] } = { font: "", tokens: [] };

            // Helper to find Y
            function findPreviousTransform(index: number, fnArray: Array<number>, argsArray: Array<any>): number {
                for (let i = index - 1; i >= 0; i--) {
                    if (fnArray[i] === pdfjsLib.OPS.transform) {
                        return argsArray[i][5]; // [a, b, c, d, e, f] last one is y
                    }
                }
                return 0;
            }

            opList.fnArray.map((opCode, index) => {
                const args = opList.argsArray[index];
                switch (opCode) {
                    case pdfjsLib.OPS.paintImageXObject: {
                        // Image handling
                        let img: Image | null = null;
                        try {
                            img = page.objs.get(args[0]);
                        } catch (err) {
                            if (args[0].startsWith("g_")) {
                                img = page.commonObjs.get(args[0]);
                            }
                        }

                        if (img && (img as any).height > 0 && (img as any).width > 0) {
                            const yPosition = findPreviousTransform(index, opList.fnArray, opList.argsArray);
                            data.tokens.push({ kind: "Image", image: { width: (img as any).width, height: (img as any).height }, y: yPosition });
                        }
                        break;
                    }
                    case pdfjsLib.OPS.setFont: {
                        if (args[0].startsWith("g_")) {
                            const font = page.commonObjs.get(args[0]);
                            data.font = font.name;
                        }
                        break;
                    }
                    case pdfjsLib.OPS.showText: {
                        if (args.length !== 1) {
                            return;
                        }
                        const text: string = args[0]
                            .filter((a: { unicode?: string }) => a.unicode)
                            .map((a: { unicode: string }) => a.unicode)
                            .join("")
                            .trim();
                        if (text !== "") {
                            data.tokens.push({ kind: "String", font: data.font, string: text });
                        }
                        break;
                    }
                }
                return null;
            }, []);
            const r = await f(data.tokens);
            // @ts-ignore
            return [r, () => page.cleanup()];
        },
        () => doc.destroy(),
    ];
};

async function run() {
    const pdfPath = 'c:/Users/wande/OneDrive/Área de Trabalho/fu-parser-main/Livros Fabula Ultima/965654264-FU-Livro-Basico.pdf';

    if (!fs.existsSync(pdfPath)) {
        console.error(`File not found: ${pdfPath}`);
        return;
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const dataArray = new Uint8Array(dataBuffer);

    try {
        console.log("Parsing PDF...");
        const [processPage, destroy] = await tokenizePDF(dataArray);

        // Check weapon pages (120-140 range guess)
        const startPage = 120;
        const endPage = 140;

        const results = [];

        for (let i = startPage; i <= endPage; i++) {
            console.log(`Processing page ${i}...`);
            try {
                const [tokens, cleanup] = await processPage(i, async (tokens) => {
                    return tokens;
                });

                results.push({
                    page: i,
                    tokens: tokens
                });

                await cleanup();
            } catch (e) {
                console.error(`Error processing page ${i}:`, e);
            }
        }

        fs.writeFileSync('c:/Users/wande/OneDrive/Área de Trabalho/fu-parser-main/debug_output.json', JSON.stringify(results, null, 2));
        console.log('Output written to debug_output.json');

        await destroy();

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
