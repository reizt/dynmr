import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynamorismaContext } from '../../context';
import { newDynamorismaId } from '../../schema/id';
import { buildItem } from '../builder/build-item';
import type { EntConfig } from '../types/config';
import type { EntRepo, InferEntWithOptionalId } from '../types/repo';
import { pretty } from '../utils/pretty-print';

type Args<E extends EntConfig> = {
	entName: string;
	entConfig: E;
	ent: InferEntWithOptionalId<E>;
};
export const $create = async <E extends EntConfig>({ entName, entConfig, ent }: Args<E>, ctx: DynamorismaContext): ReturnType<EntRepo<E>['$update']> => {
	const tableName = ctx.tableName;
	const dynamorismaId = ent.__dynamorismaId ?? newDynamorismaId();
	const item = buildItem(entName, entConfig, ent, dynamorismaId);

	const command = new PutItemCommand({
		TableName: tableName,
		Item: item,
	});

	if (ctx.options?.log?.query === true) {
		pretty(`Put Item: ${JSON.stringify(item, null, 2)}`, 'FgBlue');
	}

	await ctx.dynamodb.send(command);

	return {
		...ent,
		__dynamorismaId: dynamorismaId,
	};
};
