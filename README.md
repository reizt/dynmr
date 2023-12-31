Dynmr is a library to use AWS DynamoDB type-safely.

## Getting Started

```sh
npm i dynmr @aws-sdk/client-dynamodb
```

## Example

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { type DynmrSchema, createDynmr } from 'dynmr';

const config = {
  user: {
    id: { type: 'S' },
    name: { type: 'S', optional: true },
    age: { type: 'N' },
    sex: { type: 'S', enum: ['male', 'female'] as const },
  },
} satisfies DynmrSchema;

const client = createDynmr({
  dynamodb: new DynamoDBClient({}),
  tableName: 'xxx',
  schema: config,
});

await client.user.put({
  id: 'xxx',
  name: 'John Doe',
  age: 25,
  sex: 'male',
});

const user = await client.user.pick({
  where: { id: { eq: 'xxx' } },
});

if (user == null) {
  throw new Error('user not found');
}

await client.user.update({
  ...user,
  age: user.age + 1,
});

await client.user.del({ dynmrId });
```
