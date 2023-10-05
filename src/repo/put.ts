import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { Context } from '../context';
import { buildItem } from '../rules/build-item';
import { newDynmrId } from '../rules/id';
import type { EntConfig } from '../types/config';
import type { EntRepo, PutIn } from '../types/repo';

type Args<E extends EntConfig> = {
  entName: string;
  entSchema: E;
  input: PutIn<E>;
};
export const put = async <E extends EntConfig>({ entName, entSchema, input }: Args<E>, ctx: Context): ReturnType<EntRepo<E>['put']> => {
  const ent = input.ent;

  const dynmrId = newDynmrId();
  const item = buildItem(entName, entSchema, ent, dynmrId);

  const command = new PutItemCommand({
    TableName: ctx.tableName,
    Item: item,
  });

  await ctx.dynamodb.send(command);

  return { dynmrId };
};
