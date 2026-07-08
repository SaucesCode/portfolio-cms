// Ensures at most one record has `flagField` set to true for a given model.
async function enforceSingleton(prisma, modelName, flagField, keepId) {
  await prisma[modelName].updateMany({
    where: { [flagField]: true, id: { not: keepId } },
    data: { [flagField]: false },
  });
}

module.exports = { enforceSingleton };
