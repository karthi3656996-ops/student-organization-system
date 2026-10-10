import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingEvent = await prisma.event.findFirst({
    where: { slug: "spring-gala-2026" },
  });

  if (!existingEvent) {
    const event = await prisma.event.create({
      data: {
        title: "Skyline Annual Spring Gala 2026",
        slug: "spring-gala-2026",
        description:
          "An evening of live campus performances, awards ceremony, and network dinner. Tickets are available online 24/7 with direct mobile passes.",
        venue: "Grand Campus Hall",
        startTime: new Date("2026-04-18T18:30:00Z"),
        endTime: new Date("2026-04-18T22:30:00Z"),
        totalCapacity: 200,
        status: "PUBLISHED",
        ticketTiers: {
          create: [
            {
              tierName: "Member Discount Pass",
              price: 10.0,
              isMemberOnly: true,
              capacityLimit: 120,
            },
            {
              tierName: "General Public / Guest",
              price: 25.0,
              isMemberOnly: false,
              capacityLimit: 80,
            },
          ],
        },
      },
    });
    console.log("Seeded event:", event.title);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
