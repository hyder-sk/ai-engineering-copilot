export async function loadUsersWithPosts(db: {
  users: { findMany: () => Promise<Array<{ id: number }>> };
  posts: { findMany: (args: { where: { userId: number } }) => Promise<unknown[]> };
}) {
  const users = await db.users.findMany();
  const enriched = [];
  for (const user of users) {
    const posts = await db.posts.findMany({ where: { userId: user.id } });
    enriched.push({ ...user, posts });
  }
  return enriched;
}
