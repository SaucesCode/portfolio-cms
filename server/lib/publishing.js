// Flips any SCHEDULED row whose time has arrived to PUBLISHED.
// Called at the top of list routes so status is always accurate without a cron worker.
async function promoteDueScheduled(prisma, modelName) {
  const now = new Date();
  const due = await prisma[modelName].findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
  });
  if (due.length === 0) return;

  await Promise.all(
    due.map(item =>
      prisma[modelName].update({
        where: { id: item.id },
        data: {
          status: "PUBLISHED",
          publishedAt: item.publishedAt || item.scheduledAt,
        },
      }),
    ),
  );
}

module.exports = { promoteDueScheduled };
