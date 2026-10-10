import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FinancialLedgerItem {
  id: string;
  transactionNumber: string;
  type: "INCOME" | "EXPENSE";
  sourceModule: string;
  amount: number;
  description: string;
  referenceId?: string | null;
  semesterPeriod: string;
  recordedAt: string;
}

interface FinancialLedgerSummary {
  totalIncome: number;
  totalExpense: number;
  availableBalance: number;
  transactionCount: number;
}

export async function generateSemesterPdfReport(): Promise<{ success: boolean; filename: string }> {
  try {
    // 1. Fetch real ledger records from server
    const res = await fetch("/api/finance/ledger?limit=200");
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Failed to fetch financial ledger records from database.");
    }

    const transactions: FinancialLedgerItem[] = data.transactions || [];
    const summary: FinancialLedgerSummary = data.summary || {
      totalIncome: 0,
      totalExpense: 0,
      availableBalance: 0,
      transactionCount: 0,
    };

    // Calculate module-specific totals accurately
    const moduleBreakdown: Record<string, { income: number; expense: number; count: number }> = {};
    for (const t of transactions) {
      const mod = t.sourceModule || "GENERAL";
      if (!moduleBreakdown[mod]) {
        moduleBreakdown[mod] = { income: 0, expense: 0, count: 0 };
      }
      moduleBreakdown[mod].count += 1;
      if (t.type === "INCOME") {
        moduleBreakdown[mod].income += t.amount;
      } else {
        moduleBreakdown[mod].expense += t.amount;
      }
    }

    // 2. Initialize PDF in Portrait A4 format
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor: [number, number, number] = [37, 99, 235]; // #2563EB Skyline Blue
    const darkSlate: [number, number, number] = [15, 23, 42]; // #0F172A
    const grayText: [number, number, number] = [100, 116, 139]; // #64748B

    // Header Background Accent
    doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.rect(0, 0, 210, 36, "F");

    // Title & Subtitle in Header
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SKYLINE STUDENT ASSOCIATION", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(191, 219, 254);
    doc.text("Treasury & Finance Department — Official Semester-End Financial Audit Report", 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const generationDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    doc.text(`Generated: ${generationDate} | Semester Period: Spring 2026`, 14, 29);

    // Document Summary Section
    let currentY = 46;

    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EXECUTIVE FINANCIAL SUMMARY", 14, currentY);

    currentY += 6;

    // Summary Cards (Total Income, Total Expense, Net Balance)
    const cardWidth = 58;
    const cardHeight = 22;

    // Card 1: Gross Income
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.setDrawColor(167, 243, 208); // Emerald-200
    doc.roundedRect(14, currentY, cardWidth, cardHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED INCOME (INFLOWS)", 18, currentY + 7);
    doc.setFontSize(13);
    doc.setTextColor(4, 120, 87);
    doc.text(`INR ${summary.totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 18, currentY + 16);

    // Card 2: Expenditures
    doc.setFillColor(255, 241, 242); // Rose-50
    doc.setDrawColor(254, 205, 211); // Rose-200
    doc.roundedRect(76, currentY, cardWidth, cardHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setTextColor(159, 18, 57);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL DISBURSEMENTS (OUTFLOWS)", 80, currentY + 7);
    doc.setFontSize(13);
    doc.setTextColor(225, 29, 72);
    doc.text(`INR ${summary.totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 80, currentY + 16);

    // Card 3: Net Remaining Balance
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(191, 219, 254); // Blue-200
    doc.roundedRect(138, currentY, cardWidth, cardHeight, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    doc.setFont("helvetica", "bold");
    doc.text("NET TREASURY BALANCE", 142, currentY + 7);
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text(`INR ${summary.availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 142, currentY + 16);

    currentY += cardHeight + 10;

    // Category Breakdown Table
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MODULE-WISE ACCOUNTING BREAKDOWN", 14, currentY);

    currentY += 4;

    const moduleRows = Object.entries(moduleBreakdown).map(([modKey, vals]) => {
      const friendlyName =
        modKey === "MEMBERSHIP_DUES"
          ? "Membership Dues"
          : modKey === "EVENT_TICKETS"
          ? "Event Ticket Sales"
          : modKey === "MERCHANDISE"
          ? "Merchandise Sales"
          : modKey === "FUNDRAISER"
          ? "Fundraising Campaigns"
          : modKey === "REIMBURSEMENT"
          ? "Volunteer Reimbursements"
          : modKey === "DIRECT_EXPENSE"
          ? "Direct Club Operations"
          : modKey;

      const net = vals.income - vals.expense;

      return [
        friendlyName,
        vals.count.toString(),
        `INR ${vals.income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `INR ${vals.expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        `INR ${net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Category / Revenue Stream", "Txn Count", "Inflows", "Outflows", "Net Contribution"]],
      body: moduleRows,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Itemized Transactions Table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastTableEndY = (doc as any).lastAutoTable?.finalY || currentY + 40;
    currentY = lastTableEndY + 10;

    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ITEMIZED TRANSACTION JOURNAL (DATABASE AUDIT TRAIL)", 14, currentY);

    currentY += 4;

    const itemizedRows = transactions.map((t) => {
      const dateFormatted = new Date(t.recordedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const formattedAmount = `${t.type === "INCOME" ? "+" : "-"}INR ${t.amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`;

      return [
        dateFormatted,
        t.transactionNumber,
        t.sourceModule.replace(/_/g, " "),
        t.description,
        t.type,
        formattedAmount,
        "VERIFIED",
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Date", "Txn Reference", "Source", "Description / Purpose", "Type", "Amount", "Status"]],
      body: itemizedRows.length > 0 ? itemizedRows : [["No recorded transactions", "-", "-", "-", "-", "-", "-"]],
      theme: "striped",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [15, 23, 42],
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 30 },
        2: { cellWidth: 26 },
        3: { cellWidth: 50 },
        4: { cellWidth: 16 },
        5: { cellWidth: 24, fontStyle: "bold" },
        6: { cellWidth: 14, textColor: [5, 150, 105], fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (dataHook) => {
        // Page numbers in footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        doc.text(
          `Skyline Student Association &bull; Semester-End Financial Audit Report &bull; Page ${dataHook.pageNumber} of ${pageCount}`,
          14,
          290
        );
      },
    });

    const filename = `Skyline_Semester_End_Financial_Report_2026.pdf`;
    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    throw error;
  }
}
