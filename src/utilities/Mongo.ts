/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const db = {
  uri: process.env.MONGO_URI || "mongodb://localhost:27017",
  dbName: "sudoku"
}

export async function insertOne(collectionName: string, data: any) {
  const client = new MongoClient(db.uri, { serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    const database = client.db(db.dbName);
    const collection = database.collection(collectionName);
    const insertUser = await collection.insertOne(data);
    return JSON.parse(JSON.stringify(insertUser.insertedId));
  } 
  catch (error) {
    console.error(error);
  }
  finally {
    await client.close();
  }
}

export async function findById(collectionName: string, query: string) {
  const client = new MongoClient(db.uri, { serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    const database = client.db(db.dbName);
    const collection = database.collection(collectionName);
    const findUser = await collection.findOne({ _id: new ObjectId(query) });
    return JSON.parse(JSON.stringify(findUser));
  } 
  catch (error) {
    console.error(error);
  }
  finally {
    await client.close();
  }
}

export async function findOne(collectionName: string, query: any) {
  const client = new MongoClient(db.uri, { serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    const database = client.db(db.dbName);
    const collection = database.collection(collectionName);
    const findUser = await collection.findOne(query);
    return JSON.parse(JSON.stringify(findUser));
  } 
  catch (error) {
    console.error(error);
  }
  finally {
    await client.close();
  }
}

export async function findAll(collectionName: string) {
  const client = new MongoClient(db.uri, { serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    const database = client.db(db.dbName);
    const collection = database.collection(collectionName);
    const findUsers = await collection.find({}).toArray();
    return JSON.parse(JSON.stringify(findUsers));
  } 
  catch (error) {
    console.error(error);
  }
  finally {
    await client.close();
  }
}


export async function updateOne(collectionName: string, query: any, data: any) {
  const client = new MongoClient(db.uri, { serverApi: ServerApiVersion.v1 });
  try {
    await client.connect();
    const database = client.db(db.dbName);
    const collection = database.collection(collectionName);
    const update = await collection.updateOne({ _id: new ObjectId(query) }, { $set: data });
    return update.acknowledged;
  } 
  catch (error) {
    console.error(error);
  }
  finally {
    await client.close();
  }
}