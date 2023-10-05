import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { createDynmr } from '../src/client';
import type { DynmrSchema } from '../src/types/repo';

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

const { entity: user } = await client.user.pick({
  where: { id: { eq: 'xxx' } },
});

if (user == null) {
  throw new Error('user not found');
}

const { dynmrId } = await client.user.put({
  ent: {
    ...user,
    age: user.age + 1,
  },
});

await client.user.del({ dynmrId });
