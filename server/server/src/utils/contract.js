const DEFAULT_PAYMENT_TERMS = "10% upfront before work starts; remaining balance after project completion.";

const escapePdfText = (text) =>
    String(text ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)");

const wrapText = (text, maxLength = 92) => {
    const content = String(text ?? "").trim();
    if (!content) return [""];

    const words = content.split(/\s+/);
    const lines = [];
    let currentLine = "";

    for (const word of words) {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;
        if (nextLine.length > maxLength) {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        } else {
            currentLine = nextLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const buildContractSnapshot = ({ job, milestones = [] }) => {
    const normalizedMilestones = (milestones || []).map((milestone) => ({
        title: milestone.title,
        description: milestone.description,
        amount: Number(milestone.amount || 0),
        deadline: milestone.deadline || null,
        order: Number(milestone.order || 0),
    }));

    const milestoneBudget = normalizedMilestones.reduce((total, milestone) => total + Number(milestone.amount || 0), 0);
    const baseBudget = Number(job?.payment?.amount || 0);
    const hourlyFallback = Number(job?.hourlyRate || 0);
    const totalCost = Math.max(milestoneBudget, baseBudget, hourlyFallback, 1);
    const initialPaymentAmount = Math.max(1, Math.round(totalCost * 0.1));

    const milestoneDeadlines = normalizedMilestones
        .map((milestone) => milestone.deadline ? new Date(milestone.deadline) : null)
        .filter((deadline) => deadline && !Number.isNaN(deadline.getTime()));

    const timelineStart = job?.createdAt ? new Date(job.createdAt) : new Date();
    const timelineEnd = milestoneDeadlines.length > 0
        ? new Date(Math.max(...milestoneDeadlines.map((deadline) => deadline.getTime())))
        : new Date(timelineStart.getTime() + 30 * 24 * 60 * 60 * 1000);

    const paymentSchedule = [
        {
            label: "Initial deposit",
            amount: initialPaymentAmount,
            note: "Paid before work starts",
        },
        {
            label: "Remaining balance",
            amount: Math.max(totalCost - initialPaymentAmount, 0),
            note: "Released after approved delivery",
        },
    ];

    return {
        totalCost,
        initialPaymentAmount,
        paymentTerms: DEFAULT_PAYMENT_TERMS,
        timelineStart,
        timelineEnd,
        milestones: normalizedMilestones,
        paymentSchedule,
    };
};

export const buildContractPdfLines = ({ job, client, freelancer, snapshot }) => {
    const lines = [];

    lines.push({ text: "PROJECT CONTRACT AGREEMENT", font: "bold", size: 18 });
    lines.push({ text: `Project: ${job.title}`, font: "bold", size: 12 });
    lines.push({ text: `Generated on: ${new Date().toLocaleString()}`, font: "regular", size: 10 });
    lines.push({ text: `Contract status: ${job.contract?.status || "draft"}`, font: "regular", size: 10 });
    lines.push({ text: "", font: "regular", size: 10 });

    lines.push({ text: "CLIENT DETAILS", font: "bold", size: 13 });
    lines.push({ text: `Name: ${client?.name?.firstName || ""} ${client?.name?.lastName || ""}`.trim(), font: "regular", size: 10 });
    lines.push({ text: `Email: ${client?.email || "N/A"}`, font: "regular", size: 10 });
    lines.push({ text: `Role: Client`, font: "regular", size: 10 });
    lines.push({ text: "", font: "regular", size: 10 });

    lines.push({ text: "FREELANCER DETAILS", font: "bold", size: 13 });
    lines.push({ text: `Name: ${freelancer?.name?.firstName || ""} ${freelancer?.name?.lastName || ""}`.trim(), font: "regular", size: 10 });
    lines.push({ text: `Email: ${freelancer?.email || "N/A"}`, font: "regular", size: 10 });
    lines.push({ text: `Role: Freelancer`, font: "regular", size: 10 });
    lines.push({ text: "", font: "regular", size: 10 });

    lines.push({ text: "PROJECT DETAILS", font: "bold", size: 13 });
    lines.push({ text: `Title: ${job.title}`, font: "regular", size: 10 });
    wrapText(job.description || "").forEach((line) => {
        lines.push({ text: `Scope: ${line}`, font: "regular", size: 10 });
    });
    lines.push({ text: `Total budget: ${formatCurrency(snapshot.totalCost)}`, font: "regular", size: 10 });
    lines.push({ text: `Initial payment: ${formatCurrency(snapshot.initialPaymentAmount)} (10%)`, font: "regular", size: 10 });
    lines.push({ text: `Timeline: ${snapshot.timelineStart.toLocaleDateString()} to ${snapshot.timelineEnd.toLocaleDateString()}`, font: "regular", size: 10 });
    lines.push({ text: "", font: "regular", size: 10 });

    lines.push({ text: "MILESTONES", font: "bold", size: 13 });
    if (snapshot.milestones.length === 0) {
        lines.push({ text: "No milestones have been added yet.", font: "regular", size: 10 });
    } else {
        snapshot.milestones.forEach((milestone, index) => {
            lines.push({
                text: `${index + 1}. ${milestone.title} - ${formatCurrency(milestone.amount)}${milestone.deadline ? ` - Due ${new Date(milestone.deadline).toLocaleDateString()}` : ""}`,
                font: "regular",
                size: 10,
            });
            wrapText(milestone.description || "").forEach((line) => {
                lines.push({ text: `   ${line}`, font: "regular", size: 10 });
            });
        });
    }
    lines.push({ text: "", font: "regular", size: 10 });

    lines.push({ text: "PAYMENT TERMS", font: "bold", size: 13 });
    wrapText(snapshot.paymentTerms, 88).forEach((line) => {
        lines.push({ text: line, font: "regular", size: 10 });
    });
    snapshot.paymentSchedule.forEach((step) => {
        lines.push({ text: `${step.label}: ${formatCurrency(step.amount)} - ${step.note}`, font: "regular", size: 10 });
    });
    lines.push({ text: "", font: "regular", size: 10 });

    lines.push({ text: "APPROVAL STATUS", font: "bold", size: 13 });
    lines.push({ text: `Client approved: ${job.contract?.clientApproved ? "Yes" : "No"}`, font: "regular", size: 10 });
    lines.push({ text: `Freelancer approved: ${job.contract?.freelancerApproved ? "Yes" : "No"}`, font: "regular", size: 10 });
    lines.push({ text: `Initial payment completed: ${job.contract?.initialPaymentDone ? "Yes" : "No"}`, font: "regular", size: 10 });

    return lines;
};

export const generateContractPdfBuffer = ({ lines, title = "Project Contract" }) => {
    const pages = [];
    const maxLinesPerPage = 34;
    const contentLines = lines.map((line) => ({
        ...line,
        text: String(line.text ?? ""),
    }));

    for (let index = 0; index < contentLines.length; index += maxLinesPerPage) {
        pages.push(contentLines.slice(index, index + maxLinesPerPage));
    }

    if (pages.length === 0) {
        pages.push([]);
    }

    const objects = [];
    const fontRegularRef = 3;
    const fontBoldRef = 4;
    const firstContentRef = 5;
    const firstPageRef = 6;

    const pageRefs = pages.map((_, index) => firstPageRef + index * 2);
    const contentRefs = pages.map((_, index) => firstContentRef + index * 2);

    const createPageContent = (pageLines) => {
        const commands = ["BT", "1 0 0 1 50 800 Tm", "/F2 18 Tf", "14 TL", `(${escapePdfText(title)}) Tj`, "T*", "/F1 10 Tf"];

        pageLines.forEach((line) => {
            if (!line.text) {
                commands.push("T*");
                return;
            }

            const fontName = line.font === "bold" ? "/F2" : "/F1";
            const fontSize = line.size || (line.font === "bold" ? 12 : 10);
            commands.push(`${fontName} ${fontSize} Tf`);
            wrapText(line.text, 95).forEach((wrappedLine) => {
                commands.push(`(${escapePdfText(wrappedLine)}) Tj`);
                commands.push("T*");
            });
        });

        commands.push("ET");
        const content = commands.join("\n");
        return `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    };

    objects[0] = `<< /Type /Catalog /Pages 2 0 R >>`;
    objects[1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pages.length} >>`;
    objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
    objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

    pages.forEach((pageLines, index) => {
        const contentRef = contentRefs[index];
        const pageRef = pageRefs[index];
        objects[contentRef - 1] = createPageContent(pageLines);
        objects[pageRef - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegularRef} 0 R /F2 ${fontBoldRef} 0 R >> >> /Contents ${contentRef} 0 R >>`;
    });

    const header = "%PDF-1.4\n";
    const bodyParts = [header];
    const offsets = [0];

    objects.forEach((object, index) => {
        const objectNumber = index + 1;
        const objectString = `${objectNumber} 0 obj\n${object}\nendobj\n`;
        offsets.push(Buffer.byteLength(bodyParts.join(""), "utf8"));
        bodyParts.push(objectString);
    });

    const body = bodyParts.join("");
    const xrefOffset = Buffer.byteLength(body, "utf8");
    const xrefEntries = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];

    for (let index = 1; index <= objects.length; index += 1) {
        const offset = offsets[index] ?? 0;
        xrefEntries.push(`${String(offset).padStart(10, "0")} 00000 n `);
    }

    const trailer = [
        "trailer",
        `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
        "startxref",
        String(xrefOffset),
        "%%EOF",
    ].join("\n");

    return Buffer.from(`${body}${xrefEntries.join("\n")}\n${trailer}`, "utf8");
};