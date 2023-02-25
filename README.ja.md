# prisma-model-validator

[English](./README.md)

Utilities for prisma to validate existence and uniqueness of models.

## インストール

```bash
# npm
npm install @tekihei2317/prisma-model-validator

# yarn
yarn add @tekihei2317/prisma-model-validator
```

## 使い方

`modelValidator`に`prisma.model`を渡すことで、モデルバリデーターを作成できます。モデルバリデーターを使うと、あるフィールドがDBでユニークかどうか・存在するかどうかを確認することができます。

```ts
const userValidator = modelValidator(prisma.user)
```

### ユニーク性の確認

`modelValidator.isUnique`を使います。`isUnique`には、`prisma.model.findFirst`の引数を渡すことができます。

```ts
// true or false
const isUnique = await userValidator.isUnique({ email: 'alice@example.com' });
```

複数のフィールドのユニーク性を確認する場合は、複数のフィールドを指定します。

```ts
const postValidator = modelValidator(prisma.post)
const isUnique = await postValidator.isUnique({ userId: input.userId, slug: input.slug })
```

### ユニーク性の確認で、特定のレコードを除外する

ユニーク性を確認するときに、特定のレコードを除外したいときがあります。

例えばユーザーのプロフィールを更新するときは、メールアドレスを更新しない場合を考慮すると、自分自身は除外してユニークであることを確認したいです。

その場合は以下のように、除外するIDを指定すればよいです。

```ts
const userValidator = modelValidator(prisma.user)
const isUnique = userValidator.isUnique({ email: 'alice@example.com', id: { not: 1 } })
```

### 存在性の確認

データベースに存在することを確認するためには、`modelValidator.exists`を使います。

```ts
const userValidator = modelValidator(prisma.user)
const exists = userValidator.exists({ id: 1 })
```

`modelValidator.exists`は、`modelValidator.isUnique`とちょうど逆の結果になります。そのため、状況に応じて分かりやすい方を使うと良いでしょう。

例えば、以下のように外部キーの存在性を確認する場合は、`exists`を使う方が望ましいです。

```ts
async function createPost(input: CreatePostInput): Promise<Post> {
  if (!(await modelValidator(prisma.user).exists({ id: input.userId }))) {
    throw new Error('UserID is invalid.')
  }
  // 省略
}
```
