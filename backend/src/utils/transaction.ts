import mongoose from 'mongoose';

export async function withTransaction<T>(
  fn: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> {
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
  } catch {
    return await fn(null);
  }

  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result as T;
  } catch (err: any) {
    if (
      err?.message?.includes('Transactions are not supported') ||
      err?.message?.includes('replica set')
    ) {
      return await fn(null);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
