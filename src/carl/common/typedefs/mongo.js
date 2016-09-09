declare class MongoClient {
  connect(url: string, callback: (err: mixed, db: MongoDB) => mixed): mixed;
}

declare class MongoDB {
  collection(collectionName: string): MongoCollection;
}

declare class MongoCollection {
  s: {
    name: string,
    dbName: string
  };
  findOne(query: Object, projection: Object, callback: (err: mixed, data: Object) => void): void;
  find(query: Object, projection: Object): MongoResult;
}

declare class MongoResult {
  toArray(callback: (err: mixed, data: Array<Object>) => void): void;
}
