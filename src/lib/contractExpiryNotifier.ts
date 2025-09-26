import { prisma } from "./db";
import { sendMail } from "./mailer";
import { addDays, addMonths, isAfter, isBefore } from "date-fns";

/**
 * Finds contracts whose related partnership/employment tanggalakhir is exactly 30 days away (or within window)
 * and sends notification emails.
 * Window: now <= tanggalakhir <= now + 30 days AND not already emailed today.
 * We store a lightweight log in memory when run as a long process; for idempotency across runs you'd persist a flag.
 */
const memoryNotified = new Set<number>();

export async function findExpiringContracts(daysAhead = 30) {
  const now = new Date();
  const limit = addDays(now, daysAhead);

  // Partnership and Employment both have tanggalakhir. We'll query via the relation.
  const partnerships = await prisma.partnership.findMany({
    where: {
      tanggalakhir: {
        gte: now,
        lte: limit,
      },
    },
    include: { contract: true },
  });

  const employments = await prisma.employment.findMany({
    where: {
      tanggalakhir: {
        gte: now,
        lte: limit,
      },
    },
    include: { contract: true },
  });

  return { partnerships, employments };
}

export async function sendExpiryNotifications() {
  const { partnerships, employments } = await findExpiringContracts();
  const now = new Date();
  const in30 = addMonths(now, 1);

  let count = 0;

  for (const p of partnerships) {
    if (memoryNotified.has(p.id)) continue;
    if (
      isAfter(p.tanggalakhir, addDays(in30, 1)) ||
      isBefore(p.tanggalakhir, now)
    )
      continue;
    const subject = `Reminder: Kontrak Partnership "${
      p.judul
    }" akan berakhir ${p.tanggalakhir.toLocaleDateString("id-ID")}`;
    const html = `<p>Halo Tim,</p>
      <p>Kontrak partnership <strong>${p.judul}</strong> (Nomor: ${
      p.nomorkontrak
    }) akan berakhir pada <strong>${p.tanggalakhir.toLocaleDateString(
      "id-ID"
    )}</strong>.</p>
      <p>Mohon lakukan review atau perpanjangan jika diperlukan.</p>
      <p>Salam,<br/>iContract Scheduler</p>`;
    try {
      await sendMail({
        to: process.env.CONTRACT_NOTIFY_EMAIL || "admin@example.com",
        subject,
        html,
      });
      memoryNotified.add(p.id);
      count++;
    } catch (e) {
      console.error("Failed to send partnership expiry email", e);
    }
  }

  for (const emp of employments as any[]) {
    // cast to any to avoid potential type mismatch from generated client version
    if (memoryNotified.has(emp.id)) continue;
    if (
      isAfter(emp.tanggalakhir, addDays(in30, 1)) ||
      isBefore(emp.tanggalakhir, now)
    )
      continue;
    const subject = `Reminder: Kontrak Karyawan "${
      emp.namalengkap
    }" akan berakhir ${emp.tanggalakhir.toLocaleDateString("id-ID")}`;
    const html = `<p>Halo HR/Legal,</p>
      <p>Kontrak kerja untuk <strong>${
        emp.namalengkap
      }</strong> (Nomor Kontrak: ${
      emp.nomorkontrak
    }) akan berakhir pada <strong>${emp.tanggalakhir.toLocaleDateString(
      "id-ID"
    )}</strong>.</p>
      <p>Silakan tindak lanjuti untuk perpanjangan atau penutupan.</p>
      <p>Salam,<br/>iContract Scheduler</p>`;
    try {
      await sendMail({
        to: process.env.CONTRACT_NOTIFY_EMAIL || "hr@example.com",
        subject,
        html,
      });
      memoryNotified.add(emp.id);
      count++;
    } catch (err) {
      console.error("Failed to send employment expiry email", err);
    }
  }

  return { totalNotified: count };
}

// Standalone runner if invoked directly (node ts-node etc.)
if (require.main === module) {
  sendExpiryNotifications()
    .then((r) => {
      console.log("Expiry notification run result:", r);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
