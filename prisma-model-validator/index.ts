type PrismaModel = {
  findFirst: (...args: any[]) => Promise<any>
  findUnique: (...args: any[]) => Promise<any>
}

type ModelWhereInput<Model extends PrismaModel> = NonNullable<NonNullable<Parameters<Model['findFirst']>[0]>['where']>
type ModelWhereUniqueInput<Model extends PrismaModel> = NonNullable<
  NonNullable<Parameters<Model['findUnique']>[0]>['where']
>

type UniqueValidator<Model extends PrismaModel> = (
  fields: ModelWhereInput<Model>,
  ignore?: ModelWhereUniqueInput<Model>
) => Promise<boolean>

type ExistenceValidator<Model extends PrismaModel> = (fields: ModelWhereInput<Model>) => Promise<boolean>

export type ModelValidator<Model extends PrismaModel> = {
  isUnique: UniqueValidator<Model>
  exists: ExistenceValidator<Model>
}

function createUniqueValidator<Model extends PrismaModel>(model: Model): UniqueValidator<Model> {
  const validator: UniqueValidator<Model> = async (fields, ignore) => {
    const record = await model.findFirst({ where: fields })

    if (record === null) return true
    if (ignore) {
      const shouldIgnore = Object.entries(ignore).every(([key, value]) => record[key] === value)
      if (shouldIgnore) return true
    }
    return false
  }
  return validator
}

function createExistenceValidator<Model extends PrismaModel>(model: Model): ExistenceValidator<Model> {
  const validator: ExistenceValidator<Model> = async (fields) => {
    const record = await model.findFirst({ where: fields })

    return record !== null
  }
  return validator
}

export function modelValidator<Model extends PrismaModel>(model: Model): ModelValidator<Model> {
  return {
    isUnique: createUniqueValidator(model),
    exists: createExistenceValidator(model),
  }
}
