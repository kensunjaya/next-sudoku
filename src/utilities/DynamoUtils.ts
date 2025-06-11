/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Scoreboard } from '@/interfaces/Types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function insertOne(tableName: string, data: Scoreboard) {
  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(data),
  });
  try {
    await client.send(command);
    return data.name;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function findScoresByName(tableName: string, name: string) {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "#name = :name",
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: marshall({
      ":name": name
    }),
  });

  try {
    const response = await client.send(command);
    const scores: Scoreboard[] = response.Items ? response.Items.map(item => unmarshall(item) as Scoreboard) : [];
    return scores;
  } catch (error) {
    console.error("Error querying scores:", error);
    return [];
  }
}

export async function findOne(tableName: string, key: Record<string, any>) {
  const command = new GetItemCommand({
    TableName: tableName,
    Key: marshall(key),
  });
  try {
    const response = await client.send(command);
    return response.Item ? unmarshall(response.Item) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function findAll(tableName: string) {
  const command = new ScanCommand({ TableName: tableName });
  try {
    const response = await client.send(command);
    const records: Scoreboard[] = response.Items ? response.Items.map(item => unmarshall(item) as Scoreboard) : [];
    return records;
  } catch (error) {
    console.error(error);
    return [];
  }
}


export async function updateOne(
  tableName: string,
  name: string,
  difficulty: string,
  data: Record<string, any>
) {
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  for (const key in data) {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = data[key];
    expressionAttributeNames[`#${key}`] = key;
  }

  const command = new UpdateItemCommand({
    TableName: tableName,
    Key: marshall({ name, difficulty }),
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ExpressionAttributeNames: expressionAttributeNames,
  });

  await client.send(command);
  return true;
}
