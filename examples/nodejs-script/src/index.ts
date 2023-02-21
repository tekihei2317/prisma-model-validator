import { Post, User } from '@prisma/client'
import { modelValidator } from '@tekihei2317/prisma-model-validator'
import { prisma } from './prisma'

type CreateUserInput = {
  email: string
  name: string
}

async function createUser(input: CreateUserInput): Promise<User> {
  const userValidator = modelValidator(prisma.user)

  if (await userValidator.exists({ email: input.email })) {
    throw new Error(`Email ${input.email} is already used.`)
  }

  return await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
    },
  })
}

type CreatePostInput = {
  userId: number
  slug: string
  title: string
  content: string
}

async function createPost(input: CreatePostInput): Promise<Post> {
  if (!(await modelValidator(prisma.user).exists({ id: input.userId }))) {
    throw new Error('UserID is invalid.')
  }

  if (await modelValidator(prisma.post).exists({ userId: input.userId, slug: input.slug })) {
    throw new Error(`Slug ${input.slug} is duplicated.`)
  }

  return await prisma.post.create({
    data: {
      userId: input.userId,
      slug: input.slug,
      title: input.title,
      content: input.content,
    },
  })
}

async function main() {
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const alice = await createUser({ email: 'alice@example.com', name: 'alice' })
  const bob = await createUser({ email: 'bob@example.com', name: 'bob' })

  try {
    await createUser({ email: 'alice@example.com', name: 'alicia' })
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
  }

  const [userCount, users] = await Promise.all([prisma.user.count(), prisma.user.findMany()])
  console.log(`${userCount} users in the database.`)
  console.log(users)

  const slug = 'learn-prisma'
  await createPost({ userId: alice.id, slug, title: 'Learn prisma', content: 'todo' })
  await createPost({ userId: bob.id, slug, title: 'Learn prisma', content: 'todo' })

  try {
    await createPost({ userId: alice.id, slug, title: 'Learn prisma(Part 2)', content: 'todo' })
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
  }

  const [postCount, posts] = await Promise.all([prisma.post.count(), prisma.post.findMany()])
  console.log(`${postCount} posts in the database.`)
  console.log(posts)
}

main()
