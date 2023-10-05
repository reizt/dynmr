import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { EntConfig, InferEnt } from '../types/config';
import { buildItem } from './build-item';
import { dynmrIdAttrName, entNameAttrName } from './id';

describe(buildItem.name, () => {
  it('should return an object with the correct keys', () => {
    const entName = 'EntName';
    const entSchema = {
      foo: { type: 'S' },
      bar: { type: 'N' },
    } satisfies EntConfig;
    const ent: InferEnt<typeof entSchema> = {
      foo: 'foo',
      bar: 1,
    };
    const dynmrId = 'xxx';

    const item = buildItem(entName, entSchema, ent, dynmrId);
    const want: Record<string, AttributeValue> = {
      [dynmrIdAttrName]: { S: dynmrId },
      [entNameAttrName]: { S: entName },
      EntName_foo: { S: 'foo' },
      EntName_bar: { N: '1' },
    };
    expect(item).toEqual(want);
  });
});
