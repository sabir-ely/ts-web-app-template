import { compare, hash } from "bcryptjs";
import { db } from "../database";

type CreateUserProps = {
  username: string;
  password: string;
  metadata: Record<string, any>;
};

type VerifyPasswordProps = {
  username: string;
  password: string;
};

type GetUserProps = {
  username: string;
};

export const createUser = async ({ username, password, metadata }: CreateUserProps) => {
  return db
    .insertInto("users")
    .values({
      username,
      hashed_password: await hash(password, 10),
      metadata: JSON.stringify(metadata),
    })
    .execute();
};

export const userExists = async (username: string) => {
  const user = await db
    .selectFrom("users")
    .select("username")
    .where("username", "=", username)
    .executeTakeFirst();

  return Boolean(user);
};

export const verifyPassword = async ({ username, password }: VerifyPasswordProps) => {
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("username", "=", username)
    .executeTakeFirst();

  if (user && (await compare(password, user.hashed_password))) {
    return user;
  }

  return null;
};

export const getUser = async ({ username }: GetUserProps) => {
  const user = await db
    .selectFrom("users")
    .select(["id", "created_at", "username", "metadata"])
    .where("username", "=", username)
    .executeTakeFirst();

  return user;
};

export const getUsers = async () => {
  const users = await db
    .selectFrom("users")
    .select(["id", "created_at", "username", "metadata"])
    .execute();

  return users;
};
