import { modelValidator, ModelValidator } from '.'

const prisma = jestPrisma.client

describe('modelValidator.exists', () => {
  let userValidator: ModelValidator<typeof prisma.user>

  beforeEach(() => {
    userValidator = modelValidator(prisma.user)
  })

  it('該当するデータが存在する場合、trueになること', async () => {
    await prisma.user.create({ data: { name: 'alice', email: 'alice@example.com' } })

    expect(await userValidator.exists({ email: 'alice@example.com' })).toBe(true)
  })

  it('該当するデータが存在する場合、除外する条件を指定するとfalseになること', async () => {
    const user = await prisma.user.create({ data: { name: 'alice', email: 'alice@example.com' } })

    expect(
      await userValidator.exists({
        email: 'alice@example.com',
        id: { not: user.id },
      })
    ).toBe(false)
  })

  it('該当するデータが存在しない場合、falseになること', async () => {
    await prisma.user.create({ data: { name: 'alice', email: 'alice@example.com' } })

    expect(await userValidator.exists({ email: 'bob@example.com' })).toBe(false)
  })
})

describe('modelValidator.isUnique', () => {
  let userValidator: ModelValidator<typeof prisma.user>

  beforeEach(() => {
    userValidator = modelValidator(prisma.user)
  })

  it('該当するデータが存在しない場合、trueになること', async () => {
    expect(await userValidator.isUnique({ email: 'alice@example.com' })).toBe(true)
  })

  it('該当するデータが存在する場合、falseになること', async () => {
    await prisma.user.create({ data: { name: 'alice', email: 'alice@example.com' } })

    expect(await userValidator.isUnique({ email: 'alice@example.com' })).toBe(false)
  })
})
