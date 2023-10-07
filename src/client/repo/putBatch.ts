import { BatchWriteItemCommand, type AttributeValue } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { newDynmrId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, PutManyIn } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  input: PutManyIn<E>;
};
export const putBatch = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['putBatch']> => {
  const items: Record<string, AttributeValue>[] = [];
  const dynmrIds: string[] = [];

  for (const ent of input.entities) {
    const dynmrId = newDynmrId();
    dynmrIds.push(dynmrId);
    const item = buildItem(entName, entConfig, ent, dynmrId);
    items.push(item);
  }

  const command = new BatchWriteItemCommand({
    RequestItems: {
      [ctx.tableName]: items.map((item) => ({
        PutRequest: { Item: item },
      })),
    },
  });

  await ctx.dynamodb.send(command);

  return { dynmrIds };
};