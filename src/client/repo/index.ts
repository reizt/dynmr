import type { DynamorismaContext } from '../../context';
import type { EntConfig } from '../types/config';
import type { EntRepo } from '../types/repo';
import { $create } from './$create';
import { $createMany } from './$createMany';
import { $delete } from './$delete';
import { $deleteMany } from './$deleteMany';
import { $findMany } from './$findMany';
import { $findOne } from './$findOne';
import { $update } from './$update';
import { $updateMany } from './$updateMany';

export const createEntRepo = <E extends EntConfig>(entName: string, entConfig: E, ctx: DynamorismaContext): EntRepo<E> => {
	return {
		$findMany: async (input) => await $findMany({ entName, entConfig, input }, ctx),
		$findOne: async (input) => await $findOne({ entName, entConfig, input }, ctx),
		$create: async (ent) => await $create({ entName, entConfig, ent }, ctx),
		$createMany: async (ents) => await $createMany({ entName, entConfig, ents }, ctx),
		$update: async (ent) => await $update({ entName, entConfig, ent }, ctx),
		$updateMany: async (ents) => await $updateMany({ entName, entConfig, ents }, ctx),
		$delete: async (dynamorismaId) => await $delete({ entName, entConfig, dynamorismaId }, ctx),
		$deleteMany: async (dynamorismaIds) => await $deleteMany({ entName, entConfig, dynamorismaIds }, ctx),
	};
};
