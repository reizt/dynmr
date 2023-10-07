import { QueryCommand, type AttributeValue } from '@aws-sdk/client-dynamodb';
import type { Context } from '../../context';
import { newGsiName } from '../../schema/gsi';
import { dynmrIdAttrName } from '../../schema/id';
import { buildConditions } from '../builder/build-conditions';
import { buildExpression } from '../builder/build-expression';
import { minifyConditions } from '../builder/minify-conditions';
import type { EntConfig } from '../types/config';
import type { CollectIn, CollectOut } from '../types/repo';
import { unmarshallEnt } from '../utils/unmarshall';

type Args<E extends EntConfig> = {
  entName: string;
  entConfig: E;
  input: CollectIn<E>;
};
export const collect = async <E extends EntConfig>({ entName, entConfig, input }: Args<E>, ctx: Context): Promise<CollectOut<E>> => {
  let ExpressionAttributeNames: Record<string, string> | undefined;
  let ExpressionAttributeValues: Record<string, AttributeValue> | undefined;
  let KeyConditionExpression: string | undefined;
  let FilterExpression: string | undefined;

  if (input.where != null) {
    const out = buildConditions({
      entName,
      entConfig,
      where: input.where,
      gsiPropName: input.gsi,
    });
    const minFilterConds = out.filterConditions != null ? minifyConditions(out.filterConditions) : undefined;
    const minKeyConds = out.keyConditions != null ? minifyConditions(out.keyConditions) : undefined;
    const filterQ = minFilterConds != null ? buildExpression(minFilterConds) : undefined;
    const keyQ = minKeyConds != null ? buildExpression(minKeyConds) : undefined;
    ExpressionAttributeNames = { ...filterQ?.names, ...keyQ?.names };
    ExpressionAttributeValues = { ...filterQ?.values, ...keyQ?.values };
    FilterExpression = filterQ?.expression;
    KeyConditionExpression = keyQ?.expression;
  }

  const gsiName = input.gsi != null ? newGsiName(entName, input.gsi as string) : undefined;

  const command = new QueryCommand({
    TableName: ctx.tableName,
    IndexName: gsiName,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    KeyConditionExpression,
    FilterExpression,
    Limit: input.scanLimit,
  });

  const commandOutput = await ctx.dynamodb.send(command);
  const items = commandOutput.Items ?? [];
  if (items.length === 0) {
    return { entities: [], dynmrIds: [] };
  }

  const entities = items.map((item) => unmarshallEnt(entName, entConfig, item));
  const dynmrIds = items.map((item) => item[dynmrIdAttrName]!.S!);

  return { entities, dynmrIds };
};